from functools import lru_cache

from backend.app.services.data_store import DataStore
from backend.app.settings import get_settings


@lru_cache
def get_data_store() -> DataStore:
    settings = get_settings()
    return DataStore.from_files(
        scores_path=settings.scores_path,
        metadata_path=settings.metadata_path,
    )
