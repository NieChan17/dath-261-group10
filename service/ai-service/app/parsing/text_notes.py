import re

from .splitter import CHUNK_CHARS, split_text
from .types import Chunk

HEADING = re.compile(r"^(#{1,6})\s+(.*\S)\s*$")
MIN_BODY_CHARS = 200


def parse_text_notes(text: str) -> list[Chunk]:
    sections: list[tuple[str | None, str | None, str]] = []
    path: list[str] = []
    body: list[str] = []

    def flush() -> None:
        content = "\n".join(body).strip()
        if content:
            sections.append((" > ".join(path) or None, path[-1] if path else None, content))

    for line in text.splitlines():
        match = HEADING.match(line)
        if match:
            flush()
            level = len(match.group(1))
            del path[level - 1:]
            path.append(match.group(2))
            body = []
        else:
            body.append(line)
    flush()

    chunks: list[Chunk] = []
    for heading_path, title, content in sections:
        budget = CHUNK_CHARS - len(title) - 1 if title else CHUNK_CHARS
        for part in split_text(content, max(budget, MIN_BODY_CHARS)):
            chunks.append(
                Chunk(content=f"{title}\n{part}" if title else part, source_type="notes", heading_path=heading_path)
            )
    return chunks
