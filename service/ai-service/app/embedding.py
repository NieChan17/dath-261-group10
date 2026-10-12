import threading

import numpy as np

from .config import get_settings


class Embedder:
    def __init__(self, model_name: str, dim: int) -> None:
        self.model_name = model_name
        self.dim = dim
        self._model = None
        self._lock = threading.Lock()
        self.error: str | None = None

    @property
    def ready(self) -> bool:
        return self._model is not None

    def load(self):
        with self._lock:
            if self._model is None:
                from sentence_transformers import SentenceTransformer

                try:
                    model = SentenceTransformer(self.model_name, device="cpu")
                    dimension = getattr(model, "get_embedding_dimension", None) or model.get_sentence_embedding_dimension
                    actual = dimension()
                    if actual != self.dim:
                        raise RuntimeError(
                            f"{self.model_name} produces {actual}-dim vectors but EMBED_DIM is {self.dim}"
                        )
                except Exception as exc:
                    self.error = str(exc)
                    raise
                self._model = model
                self.error = None
        return self._model

    def encode(self, texts: list[str]) -> np.ndarray:
        model = self._model or self.load()
        vectors = model.encode(texts, batch_size=16, normalize_embeddings=True, convert_to_numpy=True)
        return np.asarray(vectors, dtype=np.float32)


_embedder: Embedder | None = None


def get_embedder() -> Embedder:
    global _embedder
    if _embedder is None:
        settings = get_settings()
        _embedder = Embedder(settings.embed_model, settings.embed_dim)
    return _embedder
