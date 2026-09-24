from collections.abc import Iterator
from contextlib import contextmanager

import psycopg
from pgvector.psycopg import register_vector
from psycopg_pool import ConnectionPool

from .config import get_settings
from .schema import ensure_schema

_pool: ConnectionPool | None = None


def init_db() -> None:
    global _pool
    settings = get_settings()
    with psycopg.connect(settings.database_url, autocommit=True) as conn:
        ensure_schema(conn, settings.embed_dim)
    _pool = ConnectionPool(
        settings.database_url, min_size=1, max_size=10, configure=register_vector, open=True
    )


def close_db() -> None:
    global _pool
    if _pool is not None:
        _pool.close()
        _pool = None


@contextmanager
def connection() -> Iterator[psycopg.Connection]:
    if _pool is None:
        raise RuntimeError("Database pool is not initialised")
    with _pool.connection() as conn:
        yield conn
