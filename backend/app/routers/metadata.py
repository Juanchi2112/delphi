from fastapi import APIRouter, Depends

from backend.app.deps import get_data_store
from backend.app.schemas import MetadataResponse
from backend.app.services.data_store import DataStore
from backend.app.settings import get_settings

router = APIRouter(tags=["metadata"])


@router.get("/metadata", response_model=MetadataResponse)
def get_metadata(store: DataStore = Depends(get_data_store)) -> MetadataResponse:
    settings = get_settings()
    payload = store.get_metadata(
        api_version=settings.api_version,
        artifact_version=settings.artifact_version,
    )
    return MetadataResponse.model_validate(payload)
