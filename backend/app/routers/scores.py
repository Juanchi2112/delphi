from fastapi import APIRouter, Depends, Query

from backend.app.deps import get_data_store
from backend.app.schemas import RiskLevel, ScoreItem, ScoresFilters, ScoresResponse
from backend.app.services.data_store import DataStore
from backend.app.settings import get_settings

router = APIRouter(tags=["scores"])


@router.get("/scores", response_model=ScoresResponse)
def get_scores(
    temporada: str | None = Query(default=None),
    region: str | None = Query(default=None),
    risk_level: RiskLevel | None = Query(default=None),
    min_risk: float | None = Query(default=None, ge=0.0, le=1.0),
    limit: int | None = Query(default=None, ge=1),
    store: DataStore = Depends(get_data_store),
) -> ScoresResponse:
    settings = get_settings()
    safe_limit = min(limit or settings.default_limit, settings.max_limit)
    items = store.filter_scores(
        temporada=temporada,
        region=region,
        risk_level=risk_level,
        min_risk=min_risk,
        limit=safe_limit,
    )
    validated = [ScoreItem.model_validate(x) for x in items]
    return ScoresResponse(
        items=validated,
        count=len(validated),
        filters=ScoresFilters(
            temporada=temporada,
            region=region,
            risk_level=risk_level,
            min_risk=min_risk,
            limit=safe_limit,
        ),
    )
