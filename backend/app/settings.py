from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    api_version: str = Field(default="v1", alias="API_VERSION")
    artifact_version: str = Field(default="2026-03-28", alias="ARTIFACT_VERSION")

    model_path: Path = Field(default=Path("output/model.json"), alias="MODEL_PATH")
    dataset_path: Path = Field(default=Path("output/dataset.csv"), alias="DATASET_PATH")
    scores_path: Path = Field(default=Path("output/scores_map.json"), alias="SCORES_PATH")
    metadata_path: Path = Field(default=Path("output/metadata.json"), alias="METADATA_PATH")

    default_limit: int = Field(default=5000, alias="DEFAULT_LIMIT")
    max_limit: int = Field(default=20000, alias="MAX_LIMIT")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
