import psycopg

MATERIAL_TABLE = """
CREATE TABLE IF NOT EXISTS material_embedding (
    id            BIGSERIAL PRIMARY KEY,
    material_id   TEXT        NOT NULL,
    course_id     TEXT        NOT NULL,
    lesson_id     TEXT,
    chunk_index   INT         NOT NULL,
    source_type   TEXT        NOT NULL CHECK (source_type IN ('slides', 'notes', 'transcript')),
    content       TEXT        NOT NULL,
    slide_no      INT,
    page_no       INT,
    ts_start      REAL,
    ts_end        REAL,
    heading_path  TEXT,
    embedding     vector({dim}) NOT NULL,
    tsv           tsvector GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED,
    embed_model   TEXT        NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (material_id, chunk_index)
)
"""

AUDIT_TABLE = """
CREATE TABLE IF NOT EXISTS query_audit_log (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          TEXT,
    course_id        TEXT        NOT NULL,
    lesson_id        TEXT,
    question         TEXT        NOT NULL,
    highlight        TEXT,
    answer           TEXT,
    cited_chunk_ids  BIGINT[]    NOT NULL DEFAULT '{}',
    top_score        REAL,
    in_scope         BOOLEAN     NOT NULL,
    first_token_ms   INT,
    total_ms         INT,
    rating           SMALLINT CHECK (rating IN (-1, 1)),
    comment          TEXT,
    flagged          BOOLEAN     NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
)
"""

INDEXES = [
    "CREATE INDEX IF NOT EXISTS material_embedding_hnsw ON material_embedding USING hnsw (embedding vector_cosine_ops)",
    "CREATE INDEX IF NOT EXISTS material_embedding_tsv ON material_embedding USING gin (tsv)",
    "CREATE INDEX IF NOT EXISTS material_embedding_scope ON material_embedding (course_id, lesson_id)",
    "CREATE INDEX IF NOT EXISTS query_audit_review ON query_audit_log (course_id, flagged, created_at DESC)",
]


def ensure_schema(conn: psycopg.Connection, dim: int) -> None:
    if not 1 <= dim <= 2000:
        raise ValueError(f"EMBED_DIM must be between 1 and 2000, got {dim}")
    conn.execute("CREATE EXTENSION IF NOT EXISTS vector")
    conn.execute(MATERIAL_TABLE.format(dim=dim))
    conn.execute(AUDIT_TABLE)
    for statement in INDEXES:
        conn.execute(statement)

    current = conn.execute(
        "SELECT atttypmod FROM pg_attribute "
        "WHERE attrelid = 'material_embedding'::regclass AND attname = 'embedding'"
    ).fetchone()[0]
    if current != dim:
        raise RuntimeError(
            f"material_embedding.embedding has dimension {current} but EMBED_DIM is {dim}. "
            "Drop the table (or the database volume) and re-ingest, or set EMBED_DIM back."
        )
