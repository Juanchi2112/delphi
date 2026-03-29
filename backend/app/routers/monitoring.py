from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from backend.app.deps import get_monitoring_store
from backend.app.schemas import (
    AlertCategory,
    AlertsResponse,
    MonitoringLocalidadDetail,
    MonitoringMetadataResponse,
    MonitoringScoresResponse,
    RiskLevel,
)
from backend.app.services.monitoring_store import MonitoringStore
from backend.app.settings import get_settings

router = APIRouter(prefix="/monitoring", tags=["monitoring"])


@router.get("/scores", response_model=MonitoringScoresResponse)
def get_monitoring_scores(
    temporada: str | None = Query(default=None),
    region: str | None = Query(default=None),
    risk_level: RiskLevel | None = Query(default=None),
    alert_category: AlertCategory | None = Query(default=None),
    min_risk: float | None = Query(default=None, ge=0.0, le=1.0),
    limit: int | None = Query(default=None, ge=1),
    store: MonitoringStore = Depends(get_monitoring_store),
):
    settings = get_settings()
    effective_limit = min(limit or settings.default_limit, settings.max_limit)

    items = store.get_latest_scores(
        temporada=temporada,
        region=region,
        risk_level=risk_level,
        alert_category=alert_category,
        min_risk=min_risk,
        limit=effective_limit,
    )

    return MonitoringScoresResponse(
        items=items,
        count=len(items),
        filters={
            "temporada": temporada,
            "region": region,
            "risk_level": risk_level,
            "alert_category": alert_category,
            "min_risk": min_risk,
            "limit": effective_limit,
        },
    )


@router.get("/localidades/{localidad_key}", response_model=MonitoringLocalidadDetail)
def get_monitoring_localidad(
    localidad_key: str,
    store: MonitoringStore = Depends(get_monitoring_store),
):
    return store.get_localidad_detail(localidad_key)


@router.get("/alerts", response_model=AlertsResponse)
def get_monitoring_alerts(
    temporada: str | None = Query(default=None),
    store: MonitoringStore = Depends(get_monitoring_store),
):
    return store.get_alerts_summary(temporada)


@router.get("/metadata", response_model=MonitoringMetadataResponse)
def get_monitoring_metadata(
    store: MonitoringStore = Depends(get_monitoring_store),
):
    settings = get_settings()
    return store.get_monitoring_metadata(settings.api_version, settings.artifact_version)
