import pymupdf

from .splitter import CHUNK_CHARS, split_text
from .types import Chunk


def parse_pdf_slides(data: bytes) -> list[Chunk]:
    chunks: list[Chunk] = []
    with pymupdf.open(stream=data, filetype="pdf") as doc:
        for number, page in enumerate(doc, start=1):
            text = page.get_text("text").strip()
            if not text:
                continue
            title = next((line.strip() for line in text.splitlines() if line.strip()), None)
            parts = [text] if len(text) <= CHUNK_CHARS else split_text(text)
            for part in parts:
                chunks.append(
                    Chunk(
                        content=part,
                        source_type="slides",
                        slide_no=number,
                        page_no=number,
                        heading_path=title[:200] if title else None,
                    )
                )
    return chunks
