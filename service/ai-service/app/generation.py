import logging
import re
from collections.abc import Callable, Iterator
from functools import lru_cache

import httpx
from google import genai
from google.genai import errors

from .config import get_settings
from .retrieval import Hit

logger = logging.getLogger(__name__)

MODE = "mock-extractive"
NOT_FOUND = "NOT_FOUND"
REFUSAL = (
    "I could not find this in the course materials, so I will not guess. "
    "You can post the question in the lesson discussion forum so the instructor can answer it."
)
_SENTENCE = re.compile(r"(?<=[.!?])\s+")
_MARKER = re.compile(r"\[(\d+)\]")
INSTRUCTIONS = (
    "You are a teaching assistant for a university course. Answer the student's question using only the "
    "numbered course excerpts below. Put the excerpt number in square brackets after every fact, for example "
    "[1] or [2][3]. Answer in the language of the question, in at most 120 words. If the excerpts do not "
    f"contain the answer, reply with exactly {NOT_FOUND}."
)


def format_timestamp(seconds: float) -> str:
    total = int(seconds)
    hours, rest = divmod(total, 3600)
    minutes, secs = divmod(rest, 60)
    return f"{hours}:{minutes:02d}:{secs:02d}" if hours else f"{minutes:02d}:{secs:02d}"


def citation_label(hit: Hit) -> str:
    if hit.source_type == "slides" and hit.slide_no is not None:
        return f"Slide {hit.slide_no}"
    if hit.source_type == "transcript" and hit.ts_start is not None:
        return f"Timestamp {format_timestamp(hit.ts_start)}"
    return hit.heading_path or "Notes"


def mock_answer(hits: list[Hit], max_chars: int = 400, max_citations: int = 3) -> tuple[str, list[Hit]]:
    cited = hits[:max_citations]
    sentences = _SENTENCE.split(" ".join(cited[0].content.split()))
    answer = ""
    for sentence in sentences:
        if answer and len(answer) + len(sentence) > max_chars:
            break
        answer = f"{answer} {sentence}".strip()
    return f"{answer} [1]", cited


def stream_words(text: str) -> Iterator[str]:
    words = text.split(" ")
    for index, word in enumerate(words):
        yield word if index == len(words) - 1 else word + " "


def build_prompt(question: str, hits: list[Hit]) -> str:
    excerpts = "\n\n".join(f"[{i}] ({citation_label(hit)})\n{hit.content}" for i, hit in enumerate(hits, start=1))
    return f"{INSTRUCTIONS}\n\nExcerpts:\n{excerpts}\n\nQuestion: {question}"


def renumber_citations(text: str, hits: list[Hit]) -> tuple[str, list[Hit]]:
    order: list[int] = []
    for match in _MARKER.finditer(text):
        index = int(match.group(1))
        if 1 <= index <= len(hits) and index not in order:
            order.append(index)
    new_index = {old: new for new, old in enumerate(order, start=1)}

    def replace(match: re.Match) -> str:
        index = int(match.group(1))
        return f"[{new_index[index]}]" if index in new_index else ""

    return re.sub(r"[ \t]{2,}", " ", _MARKER.sub(replace, text)).strip(), [hits[i - 1] for i in order]


def llm_answer(complete: Callable[[str], str], question: str, hits: list[Hit]) -> tuple[str, list[Hit]]:
    text = (complete(build_prompt(question, hits)) or "").strip()
    if not text or NOT_FOUND in text:
        return REFUSAL, []
    answer, cited = renumber_citations(text, hits)
    return (answer, cited) if cited else (REFUSAL, [])


def gemini_complete(client: genai.Client, model: str) -> Callable[[str], str]:
    return lambda prompt: client.models.generate_content(model=model, contents=prompt).text


def ollama_complete(url: str, model: str, timeout: float = 120) -> Callable[[str], str]:
    def complete(prompt: str) -> str:
        response = httpx.post(
            f"{url.rstrip('/')}/api/chat",
            json={
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
                "options": {"num_ctx": 8192},
            },
            timeout=timeout,
        )
        response.raise_for_status()
        return response.json()["message"]["content"]

    return complete


@lru_cache
def get_llm() -> Callable[[str], str] | None:
    settings = get_settings()
    if settings.llm_provider == "ollama":
        return ollama_complete(settings.ollama_url, settings.llm_model)
    if settings.gemini_api_key:
        return gemini_complete(genai.Client(api_key=settings.gemini_api_key), settings.llm_model)
    return None


def generate_answer(question: str, hits: list[Hit]) -> tuple[str, list[Hit], str]:
    complete = get_llm()
    if complete is not None:
        try:
            return *llm_answer(complete, question, hits), get_settings().llm_model
        except (errors.APIError, httpx.HTTPError) as exc:
            logger.warning("LLM call failed, using the mock answer: %s", exc)
    return *mock_answer(hits), MODE
