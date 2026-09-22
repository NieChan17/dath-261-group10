from dataclasses import dataclass
from typing import Literal

SourceType = Literal["slides", "notes", "transcript"]


@dataclass
class Chunk:
    content: str
    source_type: SourceType
    slide_no: int | None = None
    page_no: int | None = None
    ts_start: float | None = None
    ts_end: float | None = None
    heading_path: str | None = None
