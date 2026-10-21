from dataclasses import dataclass

import numpy as np
import psycopg


@dataclass
class Hit:
    id: int
    material_id: str
    lesson_id: str | None
    source_type: str
    content: str
    slide_no: int | None
    page_no: int | None
    ts_start: float | None
    ts_end: float | None
    heading_path: str | None
    cosine: float
    score: float = 0.0


def rrf_fuse(rankings: list[list[int]], k: int) -> dict[int, float]:
    scores: dict[int, float] = {}
    for ranking in rankings:
        for rank, item in enumerate(ranking, start=1):
            scores[item] = scores.get(item, 0.0) + 1.0 / (k + rank)
    return scores


def apply_boosts(
    hits: list[Hit],
    lesson_id: str | None,
    video_time: float | None,
    lesson_boost: float,
    video_window_boost: float,
) -> None:
    for hit in hits:
        if lesson_id and hit.lesson_id == lesson_id:
            hit.score += lesson_boost
            if (
                video_time is not None
                and hit.source_type == "transcript"
                and hit.ts_start is not None
                and hit.ts_end is not None
                and hit.ts_start <= video_time <= hit.ts_end + 30
            ):
                hit.score += video_window_boost


def hybrid_search(
    conn: psycopg.Connection,
    query: str,
    query_vec: np.ndarray,
    course_id: str,
    *,
    lesson_id: str | None = None,
    video_time: float | None = None,
    top_k: int = 5,
    candidate_pool: int = 20,
    rrf_k: int = 60,
    lesson_boost: float = 0.0,
    video_window_boost: float = 0.0,
) -> list[Hit]:
    conn.execute("SET LOCAL hnsw.ef_search = 100")
    vector_ids = [
        row[0]
        for row in conn.execute(
            "SELECT id FROM material_embedding WHERE course_id = %s ORDER BY embedding <=> %s LIMIT %s",
            (course_id, query_vec, candidate_pool),
        )
    ]
    text_ids = [
        row[0]
        for row in conn.execute(
            "SELECT m.id FROM material_embedding m, websearch_to_tsquery('simple', %s) q "
            "WHERE m.course_id = %s AND m.tsv @@ q ORDER BY ts_rank_cd(m.tsv, q) DESC LIMIT %s",
            (query, course_id, candidate_pool),
        )
    ]
    fused = rrf_fuse([vector_ids, text_ids], rrf_k)
    if not fused:
        return []

    rows = conn.execute(
        "SELECT id, material_id, lesson_id, source_type, content, slide_no, page_no, ts_start, ts_end, "
        "heading_path, 1 - (embedding <=> %s) FROM material_embedding WHERE id = ANY(%s)",
        (query_vec, list(fused)),
    ).fetchall()
    hits = [Hit(*row[:10], cosine=float(row[10]), score=fused[row[0]]) for row in rows]
    apply_boosts(hits, lesson_id, video_time, lesson_boost, video_window_boost)
    hits.sort(key=lambda hit: hit.score, reverse=True)
    return hits[:top_k]
