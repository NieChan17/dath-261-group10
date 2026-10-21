import json
import time
from collections.abc import Iterator

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse

from . import ingest
from .config import get_settings
from .db import connection
from .embedding import get_embedder
from .generation import MODE, REFUSAL, citation_label, mock_answer, stream_words
from .models import (
    AskRequest,
    DeleteResult,
    FeedbackRequest,
    IngestJob,
    IngestRequest,
    ReviewItem,
    SearchHit,
    SearchRequest,
    SearchResponse,
)
from .retrieval import Hit, hybrid_search
from .security import require_internal_token

router = APIRouter(dependencies=[Depends(require_internal_token)])


def _retrieve(course_id: str, query: str, lesson_id: str | None, video_time: float | None, top_k: int) -> list[Hit]:
    settings = get_settings()
    query_vec = get_embedder().encode([query])[0]
    with connection() as conn:
        return hybrid_search(
            conn,
            query,
            query_vec,
            course_id,
            lesson_id=lesson_id,
            video_time=video_time,
            top_k=top_k,
            candidate_pool=settings.candidate_pool,
            rrf_k=settings.rrf_k,
            lesson_boost=settings.lesson_boost,
            video_window_boost=settings.video_window_boost,
        )


def _to_search_hit(hit: Hit) -> SearchHit:
    return SearchHit(
        chunk_id=hit.id,
        material_id=hit.material_id,
        lesson_id=hit.lesson_id,
        source_type=hit.source_type,
        label=citation_label(hit),
        content=hit.content,
        slide_no=hit.slide_no,
        page_no=hit.page_no,
        ts_start=hit.ts_start,
        ts_end=hit.ts_end,
        cosine=round(hit.cosine, 4),
        score=round(hit.score, 6),
    )


def _sse(event: str, payload: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(payload, ensure_ascii=False, default=str)}\n\n"


@router.post("/ingest", response_model=IngestJob, status_code=status.HTTP_202_ACCEPTED)
def create_ingest_job(req: IngestRequest, background: BackgroundTasks) -> dict:
    job_id = ingest.create_job(req.material_id)
    background.add_task(ingest.run_job, job_id, req.material_id, req.course_id, req.lesson_id, req.type, req.file_url)
    return ingest.get_job(job_id)


@router.get("/ingest/{job_id}", response_model=IngestJob)
def get_ingest_job(job_id: str) -> dict:
    job = ingest.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@router.delete("/materials/{material_id}", response_model=DeleteResult)
def delete_material(material_id: str) -> DeleteResult:
    return DeleteResult(material_id=material_id, deleted_chunks=ingest.delete_material(material_id))


@router.post("/search", response_model=SearchResponse)
def search(req: SearchRequest) -> SearchResponse:
    threshold = get_settings().oos_threshold
    hits = _retrieve(req.course_id, req.query, req.lesson_id, None, req.top_k)
    top_score = max((hit.cosine for hit in hits), default=0.0)
    return SearchResponse(
        top_score=round(top_score, 4),
        in_scope=bool(hits) and top_score >= threshold,
        threshold=threshold,
        results=[_to_search_hit(hit) for hit in hits],
    )


@router.post("/ask")
def ask(req: AskRequest) -> StreamingResponse:
    settings = get_settings()
    started = time.perf_counter()
    query = f"{req.highlight}\n{req.question}" if req.highlight else req.question
    hits = _retrieve(req.course_id, query, req.lesson_id, req.video_time, settings.top_k)
    top_score = max((hit.cosine for hit in hits), default=0.0)
    in_scope = bool(hits) and top_score >= settings.oos_threshold
    answer, cited = mock_answer(hits) if in_scope else (REFUSAL, [])

    def events() -> Iterator[str]:
        first_token_ms = None
        for token in stream_words(answer):
            if first_token_ms is None:
                first_token_ms = int((time.perf_counter() - started) * 1000)
            yield _sse("token", {"text": token})
        for index, hit in enumerate(cited, start=1):
            yield _sse("citation", {"index": index, **_to_search_hit(hit).model_dump(exclude={"content", "score"})})

        total_ms = int((time.perf_counter() - started) * 1000)
        with connection() as conn:
            answer_id = conn.execute(
                "INSERT INTO query_audit_log (user_id, course_id, lesson_id, question, highlight, answer, "
                "cited_chunk_ids, top_score, in_scope, first_token_ms, total_ms, flagged) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id",
                (
                    req.user_id, req.course_id, req.lesson_id, req.question, req.highlight, answer,
                    [hit.id for hit in cited], top_score, in_scope, first_token_ms, total_ms, not in_scope,
                ),
            ).fetchone()[0]
        yield _sse(
            "done",
            {
                "answer_id": answer_id,
                "in_scope": in_scope,
                "top_score": round(top_score, 4),
                "suggest_forum": not in_scope,
                "mode": MODE,
                "first_token_ms": first_token_ms,
                "total_ms": total_ms,
            },
        )

    return StreamingResponse(
        events(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"}
    )


@router.post("/feedback", status_code=status.HTTP_204_NO_CONTENT)
def feedback(req: FeedbackRequest) -> None:
    with connection() as conn:
        row = conn.execute(
            "UPDATE query_audit_log SET rating = %s, comment = %s, flagged = flagged OR %s "
            "WHERE id = %s RETURNING id",
            (req.rating, req.comment, req.rating == -1, req.answer_id),
        ).fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Answer not found")


@router.get("/review", response_model=list[ReviewItem])
def review(
    course_id: str = Query(min_length=1, max_length=128),
    flagged: bool = True,
    limit: int = Query(default=50, ge=1, le=200),
) -> list[ReviewItem]:
    with connection() as conn:
        rows = conn.execute(
            "SELECT id, lesson_id, question, highlight, answer, top_score, in_scope, rating, comment, flagged, "
            "created_at FROM query_audit_log WHERE course_id = %s AND (NOT %s OR flagged) "
            "ORDER BY created_at DESC LIMIT %s",
            (course_id, flagged, limit),
        ).fetchall()
    fields = list(ReviewItem.model_fields)
    return [ReviewItem(**dict(zip(fields, row))) for row in rows]
