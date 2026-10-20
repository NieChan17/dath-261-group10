import re
from collections.abc import Iterator

from .retrieval import Hit

MODE = "mock-extractive"
REFUSAL = (
    "I could not find this in the course materials, so I will not guess. "
    "You can post the question in the lesson discussion forum so the instructor can answer it."
)
_SENTENCE = re.compile(r"(?<=[.!?])\s+")


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
