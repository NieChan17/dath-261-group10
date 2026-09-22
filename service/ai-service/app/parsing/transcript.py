import re
from dataclasses import dataclass

from .types import Chunk

_TIME = r"(?:(\d{1,2}):)?(\d{1,2}):(\d{2})[.,](\d{1,3})"
CUE_TIMING = re.compile(_TIME + r"\s*-->\s*" + _TIME)
INLINE_TAG = re.compile(r"<[^>]+>")
SENTENCE_END = (".", "?", "!")


@dataclass
class Cue:
    start: float
    end: float
    text: str


def _seconds(hours: str | None, minutes: str, seconds: str, millis: str) -> float:
    return int(hours or 0) * 3600 + int(minutes) * 60 + int(seconds) + int(millis.ljust(3, "0")) / 1000


def parse_cues(text: str) -> list[Cue]:
    lines = text.replace("\r\n", "\n").split("\n")
    cues: list[Cue] = []
    i = 0
    while i < len(lines):
        match = CUE_TIMING.search(lines[i])
        i += 1
        if not match:
            continue
        groups = match.groups()
        start, end = _seconds(*groups[:4]), _seconds(*groups[4:])
        words: list[str] = []
        while i < len(lines) and lines[i].strip():
            words.append(INLINE_TAG.sub("", lines[i]).strip())
            i += 1
        content = " ".join(w for w in words if w)
        if content:
            cues.append(Cue(start, end, content))
    return cues


def parse_transcript(text: str, target_seconds: float = 60.0, max_seconds: float = 90.0) -> list[Chunk]:
    chunks: list[Chunk] = []
    window: list[Cue] = []

    def close() -> None:
        chunks.append(
            Chunk(
                content=" ".join(cue.text for cue in window),
                source_type="transcript",
                ts_start=window[0].start,
                ts_end=window[-1].end,
            )
        )

    for cue in parse_cues(text):
        window.append(cue)
        duration = cue.end - window[0].start
        if duration >= max_seconds or (duration >= target_seconds and cue.text.rstrip().endswith(SENTENCE_END)):
            close()
            window = []
    if window:
        close()
    return chunks
