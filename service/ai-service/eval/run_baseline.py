import argparse
import json
import statistics
import time
from datetime import date
from pathlib import Path

from app.config import get_settings
from app.db import close_db, connection, init_db
from app.embedding import get_embedder
from app.generation import citation_label, mock_answer
from app.retrieval import Hit, hybrid_search

HERE = Path(__file__).parent
THRESHOLDS = [round(0.30 + 0.05 * i, 2) for i in range(11)]


def vector_search(conn, query_vec, course_id: str, top_k: int) -> list[Hit]:
    conn.execute("SET LOCAL hnsw.ef_search = 100")
    rows = conn.execute(
        "SELECT id, material_id, lesson_id, source_type, content, slide_no, page_no, ts_start, ts_end, "
        "heading_path, 1 - (embedding <=> %s) FROM material_embedding WHERE course_id = %s "
        "ORDER BY embedding <=> %s LIMIT %s",
        (query_vec, course_id, query_vec, top_k),
    ).fetchall()
    return [Hit(*row[:10], cosine=float(row[10])) for row in rows]


def normalize(text: str) -> str:
    text = "".join(" " if "\ue000" <= ch <= "\uf8ff" else ch for ch in text)
    return " ".join(text.lower().split())


def is_gold(hit: Hit, gold: list[dict]) -> bool:
    for g in gold:
        if "contains" in g and normalize(g["contains"]) in normalize(hit.content):
            return True
        if hit.material_id != g.get("material_id"):
            continue
        if "slide_no" in g and hit.slide_no == g["slide_no"]:
            return True
        if "heading" in g and hit.heading_path and hit.heading_path.split(" > ")[-1] == g["heading"]:
            return True
        if "ts" in g and hit.ts_start is not None and hit.ts_start <= g["ts"] <= hit.ts_end:
            return True
    return False


def first_gold_rank(hits: list[Hit], gold: list[dict]) -> int | None:
    return next((rank for rank, hit in enumerate(hits, start=1) if is_gold(hit, gold)), None)


def grounded(answer: str, source: str) -> bool:
    return normalize(answer.removesuffix(" [1]")) in normalize(source)


def retrieval_metrics(rows: list[dict], key: str) -> dict:
    ranks = [row[key] for row in rows]
    n = len(ranks)
    return {
        "n": n,
        "hit@1": sum(r == 1 for r in ranks) / n,
        "hit@3": sum(r is not None and r <= 3 for r in ranks) / n,
        "recall@5": sum(r is not None for r in ranks) / n,
        "mrr": sum(1 / r for r in ranks if r) / n,
    }


def gate_metrics(rows: list[dict], threshold: float) -> dict:
    in_scope = [row for row in rows if row["in_scope_gold"]]
    oos = [row for row in rows if not row["in_scope_gold"]]
    answered = sum(row["top_cosine"] >= threshold for row in in_scope)
    refused = sum(row["top_cosine"] < threshold for row in oos)
    return {
        "threshold": threshold,
        "answer_rate_in_scope": answered / len(in_scope),
        "refusal_rate_oos": refused / len(oos),
        "accuracy": (answered + refused) / len(rows),
    }


def run(questions_path: Path, default_course: str, top_k: int) -> dict:
    settings = get_settings()
    embedder = get_embedder()
    questions = [json.loads(line) for line in questions_path.read_text(encoding="utf-8").splitlines() if line]
    embedder.encode(["warm-up"])
    rows = []
    for q in questions:
        course_id = q.get("course_id", default_course)
        started = time.perf_counter()
        query_vec = embedder.encode([q["question"]])[0]
        with connection() as conn:
            hybrid = hybrid_search(
                conn, q["question"], query_vec, course_id,
                top_k=top_k, candidate_pool=settings.candidate_pool, rrf_k=settings.rrf_k,
            )
        latency_ms = (time.perf_counter() - started) * 1000
        with connection() as conn:
            vector = vector_search(conn, query_vec, course_id, top_k)
        top_cosine = max((hit.cosine for hit in hybrid), default=0.0)
        row = {
            "id": q["id"],
            "course_id": course_id,
            "lang": q["lang"],
            "question": q["question"],
            "in_scope_gold": bool(q["gold"]),
            "top_cosine": round(top_cosine, 4),
            "latency_ms": round(latency_ms, 1),
            "hybrid_top3": [citation_label(hit) for hit in hybrid[:3]],
        }
        if q["gold"]:
            row["rank_hybrid"] = first_gold_rank(hybrid, q["gold"])
            row["rank_vector"] = first_gold_rank(vector, q["gold"])
            answer, cited = mock_answer(hybrid)
            row["citations"] = [is_gold(hit, q["gold"]) for hit in cited]
            row["grounded"] = grounded(answer, cited[0].content)
        rows.append(row)

    in_scope = [row for row in rows if row["in_scope_gold"]]
    groups = {
        "en": [row for row in in_scope if row["lang"] == "en"],
        "vi": [row for row in in_scope if row["lang"] == "vi"],
        default_course: [row for row in in_scope if row["course_id"] == default_course],
        "other courses": [row for row in in_scope if row["course_id"] != default_course],
    }
    all_citations = [flag for row in in_scope for flag in row["citations"]]
    return {
        "date": date.today().isoformat(),
        "questions_file": questions_path.name,
        "embed_model": settings.embed_model,
        "course_id": default_course,
        "top_k": top_k,
        "oos_threshold": settings.oos_threshold,
        "questions": {"in_scope": len(in_scope), "out_of_scope": len(rows) - len(in_scope)},
        "retrieval": {
            "hybrid": retrieval_metrics(in_scope, "rank_hybrid"),
            "vector_only": retrieval_metrics(in_scope, "rank_vector"),
            "hybrid_by_group": {name: retrieval_metrics(group, "rank_hybrid") for name, group in groups.items() if group},
        },
        "answers": {
            "groundedness": sum(row["grounded"] for row in in_scope) / len(in_scope),
            "citation_precision_first": sum(row["citations"][0] for row in in_scope) / len(in_scope),
            "citation_precision_all": sum(all_citations) / len(all_citations),
        },
        "gate_current": gate_metrics(rows, settings.oos_threshold),
        "gate_sweep": [gate_metrics(rows, t) for t in THRESHOLDS],
        "latency_ms_median": statistics.median(row["latency_ms"] for row in rows),
        "rows": rows,
    }


def to_markdown(result: dict) -> str:
    pct = lambda v: f"{v * 100:.1f}%"
    r = result["retrieval"]
    lines = [
        f"# RAG baseline – {result['date']} ({result['questions_file']})",
        "",
        f"Model `{result['embed_model']}`, top_k {result['top_k']}, "
        f"{result['questions']['in_scope']} in-scope + {result['questions']['out_of_scope']} out-of-scope questions.",
        "",
        "| Retrieval | n | Hit@1 | Hit@3 | Recall@5 | MRR |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    named = [("Hybrid (vector + full-text, RRF)", r["hybrid"]), ("Vector only", r["vector_only"])]
    named += [(f"Hybrid – {name}", m) for name, m in r["hybrid_by_group"].items()]
    for name, m in named:
        lines.append(f"| {name} | {m['n']} | {pct(m['hit@1'])} | {pct(m['hit@3'])} | {pct(m['recall@5'])} | {m['mrr']:.3f} |")
    a = result["answers"]
    lines += [
        "",
        "| Answer metric | Value |",
        "| --- | --- |",
        f"| Groundedness (answer text found in cited chunk) | {pct(a['groundedness'])} |",
        f"| Citation precision, citation [1] | {pct(a['citation_precision_first'])} |",
        f"| Citation precision, all citations shown (max 3) | {pct(a['citation_precision_all'])} |",
        f"| Median retrieval latency (embed + search, CPU) | {result['latency_ms_median']} ms |",
        "",
        "| OOS threshold | In-scope answered | Out-of-scope refused | Accuracy |",
        "| --- | --- | --- | --- |",
    ]
    for g in result["gate_sweep"]:
        mark = " (current)" if g["threshold"] == result["oos_threshold"] else ""
        lines.append(
            f"| {g['threshold']:.2f}{mark} | {pct(g['answer_rate_in_scope'])} | {pct(g['refusal_rate_oos'])} | {pct(g['accuracy'])} |"
        )
    lines += [
        "",
        "| ID | Course | Lang | Top cosine | Rank hybrid | Rank vector | Top citation |",
        "| --- | --- | --- | --- | --- | --- | --- |",
    ]
    for row in result["rows"]:
        lines.append(
            f"| {row['id']} | {row['course_id']} | {row['lang']} | {row['top_cosine']:.3f} | {row.get('rank_hybrid', '–')} | "
            f"{row.get('rank_vector', '–')} | {row['hybrid_top3'][0] if row['hybrid_top3'] else '–'} |"
        )
    return "\n".join(lines) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(prog="python -m eval.run_baseline")
    parser.add_argument("--questions", type=Path, default=HERE / "questions.jsonl")
    parser.add_argument("--course-id", default="CO3001", help="Course for questions without a course_id")
    parser.add_argument("--top-k", type=int, default=5)
    parser.add_argument("--out", type=Path, default=HERE / "results")
    args = parser.parse_args()

    init_db()
    try:
        result = run(args.questions, args.course_id, args.top_k)
    finally:
        close_db()
    args.out.mkdir(parents=True, exist_ok=True)
    stem = f"baseline-{result['date']}-{args.questions.stem}"
    (args.out / f"{stem}.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    report = to_markdown(result)
    (args.out / f"{stem}.md").write_text(report, encoding="utf-8")
    print(report)


if __name__ == "__main__":
    main()
