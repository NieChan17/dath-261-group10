import argparse
import asyncio
import json
import math
import re
import statistics
import time
from datetime import date
from pathlib import Path

from google import genai
from openai import AsyncOpenAI
from ragas.embeddings.base import BaseRagasEmbedding
from ragas.llms import llm_factory
from ragas.metrics.collections import AnswerRelevancy, Faithfulness

from app.config import get_settings
from app.db import close_db, connection, init_db
from app.embedding import get_embedder
from app.generation import citation_label, gemini_complete, llm_answer, ollama_complete
from app.retrieval import hybrid_search

HERE = Path(__file__).parent
RETRYABLE = ("429", "RESOURCE_EXHAUSTED", "503", "UNAVAILABLE")
GEMINI_OPENAI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
JUDGE_MODEL = "gemini-3.5-flash-lite"


class LocalEmbeddings(BaseRagasEmbedding):
    def embed_text(self, text: str, **kwargs) -> list[float]:
        return get_embedder().encode([text])[0].tolist()

    async def aembed_text(self, text: str, **kwargs) -> list[float]:
        return self.embed_text(text)


def retrieve(question: str, course_id: str, top_k: int):
    settings = get_settings()
    query_vec = get_embedder().encode([question])[0]
    with connection() as conn:
        return hybrid_search(
            conn, question, query_vec, course_id,
            top_k=top_k, candidate_pool=settings.candidate_pool, rrf_k=settings.rrf_k,
        )


async def score(faithfulness: Faithfulness, relevancy: AnswerRelevancy, question: str, answer: str, contexts):
    faith = await faithfulness.ascore(user_input=question, response=answer, retrieved_contexts=contexts)
    relevant = await relevancy.ascore(user_input=question, response=answer)
    return float(faith.value), float(relevant.value)


def evaluate(q: dict, course_id: str, args, complete, faithfulness, relevancy) -> dict:
    settings = get_settings()
    hits = retrieve(q["question"], course_id, args.top_k)
    top_cosine = max((hit.cosine for hit in hits), default=0.0)
    row = {"id": q["id"], "course_id": course_id, "lang": q["lang"], "top_cosine": round(top_cosine, 4)}
    if not hits or top_cosine < settings.oos_threshold:
        return {**row, "status": "refused_by_gate"}
    started = time.perf_counter()
    answer, cited = llm_answer(complete, q["question"], hits)
    row["answer_ms"] = round((time.perf_counter() - started) * 1000)
    if not cited:
        return {**row, "status": "refused_by_llm", "answer": answer}
    faith, relevant = asyncio.run(score(faithfulness, relevancy, q["question"], answer, [h.content for h in hits]))
    return {
        **row,
        "status": "answered",
        "answer": answer,
        "citations": [citation_label(hit) for hit in cited],
        "faithfulness": faith,
        "answer_relevancy": relevant,
    }


def evaluate_with_retry(q: dict, course_id: str, args, *clients) -> dict:
    for attempt in range(args.retries + 1):
        try:
            return evaluate(q, course_id, args, *clients)
        except Exception as exc:
            if attempt == args.retries or not any(code in str(exc) for code in RETRYABLE):
                return {"id": q["id"], "course_id": course_id, "lang": q["lang"], "status": "error",
                        "error": f"{type(exc).__name__}: {str(exc)[:300]}"}
            print(f"{q['id']}: {type(exc).__name__}, retrying in {args.wait}s")
            time.sleep(args.wait)


def mean(values: list[float]) -> float | None:
    values = [v for v in values if not math.isnan(v)]
    return round(statistics.fmean(values), 4) if values else None


def summarize(rows: list[dict], args) -> dict:
    answered = [r for r in rows if r["status"] == "answered"]
    answer_ms = [r["answer_ms"] for r in rows if "answer_ms" in r]
    groups = {"all": answered, "en": [r for r in answered if r["lang"] == "en"],
              "vi": [r for r in answered if r["lang"] == "vi"]}
    return {
        "date": date.today().isoformat(),
        "questions_file": args.questions.name,
        "provider": args.provider,
        "model": args.model,
        "judge_model": args.judge_model,
        "embed_model": get_settings().embed_model,
        "oos_threshold": get_settings().oos_threshold,
        "answer_ms_median": round(statistics.median(answer_ms)) if answer_ms else None,
        "status": {s: sum(r["status"] == s for r in rows)
                   for s in ("answered", "refused_by_gate", "refused_by_llm", "error")},
        "scores": {name: {"n": len(group),
                          "faithfulness": mean([r["faithfulness"] for r in group]),
                          "answer_relevancy": mean([r["answer_relevancy"] for r in group])}
                   for name, group in groups.items()},
        "rows": [{k: v for k, v in r.items() if k != "answer"} for r in rows],
    }


def to_markdown(result: dict) -> str:
    lines = [
        f"# RAGAS – {result['date']} ({result['questions_file']})",
        "",
        f"Answer model `{result['model']}` ({result['provider']}), judge `{result['judge_model']}`, "
        f"embeddings `{result['embed_model']}`, OOS_THRESHOLD {result['oos_threshold']}, "
        f"median answer time {result['answer_ms_median']} ms.",
        "",
        "| Status | Questions |",
        "|---|---|",
        *[f"| {status} | {count} |" for status, count in result["status"].items()],
        "",
        "| Group | n | Faithfulness | Answer relevancy |",
        "|---|---|---|---|",
        *[f"| {name} | {s['n']} | {s['faithfulness']} | {s['answer_relevancy']} |"
          for name, s in result["scores"].items()],
        "",
        "| ID | Course | Lang | Status | Faithfulness | Answer relevancy | Citations |",
        "|---|---|---|---|---|---|---|",
    ]
    for r in result["rows"]:
        faith = r.get("faithfulness")
        relevant = r.get("answer_relevancy")
        lines.append(
            f"| {r['id']} | {r['course_id']} | {r['lang']} | {r['status']} | "
            f"{'–' if faith is None else round(faith, 3)} | {'–' if relevant is None else round(relevant, 3)} | "
            f"{', '.join(r.get('citations', [])) or '–'} |"
        )
    return "\n".join(lines) + "\n"


def main() -> None:
    settings = get_settings()
    parser = argparse.ArgumentParser(prog="python -m eval.run_ragas")
    parser.add_argument("--questions", type=Path, default=HERE / "questions.jsonl")
    parser.add_argument("--course-id", default="CO3001", help="Course for questions without a course_id")
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--provider", choices=["gemini", "ollama"], default=settings.llm_provider)
    parser.add_argument("--model", default=settings.llm_model)
    parser.add_argument("--judge-model", default=JUDGE_MODEL, help="Gemini model that scores the answers")
    parser.add_argument("--limit", type=int, help="Stop after this many new questions")
    parser.add_argument("--delay", type=float, default=30, help="Seconds between questions (free-tier rate limit)")
    parser.add_argument("--wait", type=float, default=60, help="Seconds to wait after a rate-limit error")
    parser.add_argument("--retries", type=int, default=3)
    parser.add_argument("--out", type=Path, default=HERE / "results")
    args = parser.parse_args()
    if not settings.gemini_api_key:
        parser.error("GEMINI_API_KEY is not set (the judge always uses Gemini)")

    questions = [json.loads(line) for line in args.questions.read_text(encoding="utf-8").splitlines() if line]
    questions = [q for q in questions if q["gold"]]
    args.out.mkdir(parents=True, exist_ok=True)
    name = f"{args.questions.stem}-{re.sub(r'[^A-Za-z0-9.]+', '-', args.model)}"
    cache = args.out / f"ragas-{name}.answers.jsonl"
    done = {}
    if cache.exists():
        for line in cache.read_text(encoding="utf-8").splitlines():
            row = json.loads(line)
            if row["status"] != "error":
                done[row["id"]] = row

    if args.provider == "ollama":
        complete = ollama_complete(settings.ollama_url, args.model)
    else:
        complete = gemini_complete(genai.Client(api_key=settings.gemini_api_key), args.model)
    judge_client = AsyncOpenAI(api_key=settings.gemini_api_key, base_url=GEMINI_OPENAI_URL)
    judge = llm_factory(args.judge_model, provider="openai", client=judge_client, max_tokens=4096)
    clients = (complete, Faithfulness(llm=judge), AnswerRelevancy(llm=judge, embeddings=LocalEmbeddings()))

    init_db()
    try:
        todo = [q for q in questions if q["id"] not in done][: args.limit]
        for index, q in enumerate(todo, start=1):
            row = evaluate_with_retry(q, q.get("course_id", args.course_id), args, *clients)
            done[q["id"]] = row
            with cache.open("a", encoding="utf-8") as f:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")
            print(f"[{index}/{len(todo)}] {q['id']} {row['status']} "
                  f"{row.get('faithfulness', '')} {row.get('answer_relevancy', '')} {row.get('error', '')}")
            if index < len(todo):
                time.sleep(args.delay)
    finally:
        close_db()

    rows = [done[q["id"]] for q in questions if q["id"] in done]
    result = summarize(rows, args)
    stem = f"ragas-{result['date']}-{name}"
    (args.out / f"{stem}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    report = to_markdown(result)
    (args.out / f"{stem}.md").write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
