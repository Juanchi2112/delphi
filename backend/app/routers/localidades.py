from fastapi import APIRouter, Depends

from backend.app.deps import get_data_store
from backend.app.schemas import LocalidadDetail
from backend.app.services.data_store import DataStore

router = APIRouter(tags=["localidades"])


@router.get("/localidades/{localidad_id}", response_model=LocalidadDetail)
def get_localidad_detail(
    localidad_id: str,
    store: DataStore = Depends(get_data_store),
) -> LocalidadDetail:
    item = store.get_localidad(localidad_id)
    return LocalidadDetail.model_validate(item)
