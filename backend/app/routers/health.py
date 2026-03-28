from fastapi import APIRouter, Depends

from backend.app.deps import get_data_store
from backend.app.schemas import HealthResponse
from backend.app.services.data_store import DataStore
from backend.app.settings import get_settings

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def get_health(store: DataStore = Depends(get_data_store)) -> HealthResponse:
    settings = get_settings()
    payload = store.health_snapshot(
        api_version=settings.api_version,
        artifact_version=settings.artifact_version,
    )
    return HealthResponse.model_validate(payload)
