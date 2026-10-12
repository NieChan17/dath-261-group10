from functools import lru_cache
from typing import Literal

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: Literal["development", "staging", "production"] = "development"

    database_url: str
    internal_token: str = ""

    embed_model: str = "BAAI/bge-m3"
    embed_dim: int = 1024

    oos_threshold: float = 0.65
    top_k: int = 5
    candidate_pool: int = 20
    rrf_k: int = 60
    lesson_boost: float = 0.005
    video_window_boost: float = 0.005

    file_root: str = "/app/sample_data"
    max_download_mb: int = 50

    @model_validator(mode="after")
    def _require_secrets_outside_development(self) -> "Settings":
        if self.app_env != "development" and not self.internal_token:
            raise ValueError("INTERNAL_TOKEN must be set when APP_ENV is not 'development'")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()
