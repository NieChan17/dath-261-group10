import threading
import uuid
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import url2pathname

import httpx

from .config import get_settings
from .db import connection
from .embedding import get_embedder
from .parsing import SourceType, parse_material


class IngestError(Exception):
    pass


_jobs: dict[str, dict] = {}
_jobs_lock = threading.Lock()


def load_bytes(file_url: str) -> bytes:
    settings = get_settings()
    limit = settings.max_download_mb * 1024 * 1024
    parsed = urlparse(file_url)

    if parsed.scheme == "file":
        root = Path(settings.file_root).resolve()
        path = Path(url2pathname(parsed.path)).resolve()
        if path != root and root not in path.parents:
            raise IngestError("file_url must point inside FILE_ROOT")
        if not path.is_file():
            raise IngestError(f"File not found: {path}")
        if path.stat().st_size > limit:
            raise IngestError("File exceeds MAX_DOWNLOAD_MB")
        return path.read_bytes()

    if parsed.scheme in ("http", "https"):
        data = bytearray()
        with httpx.stream("GET", file_url, timeout=30, follow_redirects=True) as response:
            response.raise_for_status()
            for block in response.iter_bytes():
                data.extend(block)
                if len(data) > limit:
                    raise IngestError("File exceeds MAX_DOWNLOAD_MB")
        return bytes(data)

    raise IngestError(f"Unsupported file_url scheme: {parsed.scheme or '(none)'}")


def ingest_material(
    material_id: str, course_id: str, lesson_id: str | None, source_type: SourceType, data: bytes
) -> int:
    chunks = parse_material(source_type, data)
    if not chunks:
        raise IngestError("No extractable text found in the material")

    embedder = get_embedder()
    vectors = embedder.encode([chunk.content for chunk in chunks])
    rows = [
        (
            material_id, course_id, lesson_id, index, chunk.source_type, chunk.content,
            chunk.slide_no, chunk.page_no, chunk.ts_start, chunk.ts_end, chunk.heading_path,
            vector, embedder.model_name,
        )
        for index, (chunk, vector) in enumerate(zip(chunks, vectors))
    ]
    with connection() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM material_embedding WHERE material_id = %s", (material_id,))
        cur.executemany(
            "INSERT INTO material_embedding (material_id, course_id, lesson_id, chunk_index, source_type, "
            "content, slide_no, page_no, ts_start, ts_end, heading_path, embedding, embed_model) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)",
            rows,
        )
    return len(chunks)


def delete_material(material_id: str) -> int:
    with connection() as conn, conn.cursor() as cur:
        cur.execute("DELETE FROM material_embedding WHERE material_id = %s", (material_id,))
        return cur.rowcount


def create_job(material_id: str) -> str:
    job_id = uuid.uuid4().hex
    with _jobs_lock:
        _jobs[job_id] = {"job_id": job_id, "material_id": material_id, "status": "queued", "chunks": 0, "error": None}
    return job_id


def _update_job(job_id: str, **fields) -> None:
    with _jobs_lock:
        _jobs[job_id].update(fields)


def get_job(job_id: str) -> dict | None:
    with _jobs_lock:
        job = _jobs.get(job_id)
        return dict(job) if job else None


def run_job(
    job_id: str, material_id: str, course_id: str, lesson_id: str | None, source_type: SourceType, file_url: str
) -> None:
    _update_job(job_id, status="processing")
    try:
        data = load_bytes(file_url)
        count = ingest_material(material_id, course_id, lesson_id, source_type, data)
    except Exception as exc:
        _update_job(job_id, status="failed", error=str(exc))
    else:
        _update_job(job_id, status="ready", chunks=count)
