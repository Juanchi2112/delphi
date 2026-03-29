from functools import lru_cache

from backend.app.services.data_store import DataStore
from backend.app.services.monitoring_store import MonitoringStore
from backend.app.settings import get_settings


@lru_cache
def get_data_store() -> DataStore:
    settings = get_settings()
    return DataStore.from_files(
        scores_path=settings.scores_path,
        metadata_path=settings.metadata_path,
    )


@lru_cache
def get_monitoring_store() -> MonitoringStore:
    settings = get_settings()
    return MonitoringStore.from_files(
        scores_path=settings.monitoring_scores_path,
        metadata_path=settings.monitoring_metadata_path,
    )


@lru_cache
def get_report_generator():
    from backend.app.services.report_generator import ReportGenerator

    settings = get_settings()
    return ReportGenerator(api_key=settings.openai_api_key)
