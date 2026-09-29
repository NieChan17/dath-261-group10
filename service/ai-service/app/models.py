from datetime import datetime
from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, Field

Id = Annotated[str, Field(min_length=1, max_length=128)]


class IngestRequest(BaseModel):
    material_id: Id
    course_id: Id
    lesson_id: str | None = Field(default=None, max_length=128)
    type: Literal["slides", "notes", "transcript"]
    file_url: str = Field(min_length=1, max_length=2048)


class IngestJob(BaseModel):
    job_id: str
    material_id: str
    status: Literal["queued", "processing", "ready", "failed"]
    chunks: int = 0
    error: str | None = None


class DeleteResult(BaseModel):
    material_id: str
    deleted_chunks: int


class SearchRequest(BaseModel):
    course_id: Id
    query: str = Field(min_length=1, max_length=2000)
    lesson_id: str | None = Field(default=None, max_length=128)
    top_k: int = Field(default=5, ge=1, le=20)


class SearchHit(BaseModel):
    chunk_id: int
    material_id: str
    lesson_id: str | None
    source_type: str
    label: str
    content: str
    slide_no: int | None
    page_no: int | None
    ts_start: float | None
    ts_end: float | None
    cosine: float
    score: float


class SearchResponse(BaseModel):
    top_score: float
    in_scope: bool
    threshold: float
    results: list[SearchHit]


class AskRequest(BaseModel):
    course_id: Id
    lesson_id: str | None = Field(default=None, max_length=128)
    question: str = Field(min_length=1, max_length=2000)
    highlight: str | None = Field(default=None, max_length=4000)
    video_time: float | None = Field(default=None, ge=0)
    user_id: str | None = Field(default=None, max_length=128)


class FeedbackRequest(BaseModel):
    answer_id: UUID
    rating: Literal[1, -1]
    comment: str | None = Field(default=None, max_length=1000)


class ReviewItem(BaseModel):
    answer_id: UUID
    lesson_id: str | None
    question: str
    highlight: str | None
    answer: str | None
    top_score: float | None
    in_scope: bool
    rating: int | None
    comment: str | None
    flagged: bool
    created_at: datetime


class Health(BaseModel):
    status: Literal["ok"]
    embed_model: str
    embed_dim: int
    embedder: Literal["loading", "ready", "failed"]
    embedder_error: str | None = None
