from .pdf_slides import parse_pdf_slides
from .text_notes import parse_text_notes
from .transcript import parse_transcript
from .types import Chunk, SourceType


def parse_material(source_type: SourceType, data: bytes) -> list[Chunk]:
    if source_type == "slides":
        return parse_pdf_slides(data)
    if source_type == "notes":
        return parse_text_notes(data.decode("utf-8-sig", errors="replace"))
    if source_type == "transcript":
        return parse_transcript(data.decode("utf-8-sig", errors="replace"))
    raise ValueError(f"Unsupported source type: {source_type}")


__all__ = ["Chunk", "SourceType", "parse_material", "parse_pdf_slides", "parse_text_notes", "parse_transcript"]
