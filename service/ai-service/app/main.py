import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api import router
from .config import get_settings
from .db import close_db, init_db
from .embedding import get_embedder
from .models import Health


def _warm_up_embedder() -> None:
    try:
        get_embedder().load()
    except Exception:
        pass


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    threading.Thread(target=_warm_up_embedder, daemon=True).start()
    yield
    close_db()


app = FastAPI(
    title="EduPulse AI Service",
    version="0.1.0",
    summary="Grounded AI teaching assistant: material ingestion, hybrid retrieval and cited answers.",
    lifespan=lifespan,
)
app.include_router(router)


@app.get("/health", response_model=Health)
def health() -> Health:
    settings = get_settings()
    embedder = get_embedder()
    state = "ready" if embedder.ready else ("failed" if embedder.error else "loading")
    return Health(
        status="ok",
        embed_model=settings.embed_model,
        embed_dim=settings.embed_dim,
        embedder=state,
        embedder_error=embedder.error,
    )
