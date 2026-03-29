from __future__ import annotations

import math
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from backend.app.deps import get_data_store, get_report_generator
from backend.app.schemas import ReportRequest, ReportResponse
from backend.app.services.data_store import DataStore
from backend.app.services.report_generator import ReportGenerator

router = APIRouter(tags=["informes"])


def find_nearby(
    store: DataStore,
    localidad_id: str,
    n: int = 5,
) -> list[dict[str, Any]]:
    target = store.by_id.get(localidad_id)
    if target is None:
        return []

    target_lat = float(target.get("lat", 0.0))
    target_lon = float(target.get("lon", 0.0))
    target_temporada = target.get("temporada")

    candidates: list[tuple[float, dict[str, Any]]] = []
    for item in store.scores_items:
        if item["id"] == localidad_id:
            continue
        if item.get("temporada") != target_temporada:
            continue
        lat = float(item.get("lat", 0.0))
        lon = float(item.get("lon", 0.0))
        dist = math.sqrt((lat - target_lat) ** 2 + (lon - target_lon) ** 2)
        candidates.append((dist, item))

    candidates.sort(key=lambda x: x[0])
    return [item for _, item in candidates[:n]]


@router.post("/informes/{localidad_id}", response_model=ReportResponse)
def generate_report(
    localidad_id: str,
    body: ReportRequest | None = None,
    store: DataStore = Depends(get_data_store),
    generator: ReportGenerator = Depends(get_report_generator),
) -> ReportResponse:
    if not generator.client:
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key not configured. Set OPENAI_API_KEY environment variable.",
        )

    localidad = store.get_localidad(localidad_id)
    nearby = find_nearby(store, localidad_id, n=5)

    campo_nombre = body.campo_nombre if body else None
    hectareas = body.hectareas if body else None

    report = generator.generate(
        localidad=localidad,
        nearby=nearby,
        campo_nombre=campo_nombre,
        hectareas=hectareas,
    )

    return ReportResponse(
        localidad=localidad.get("localidad", ""),
        provincia=localidad.get("provincia", ""),
        region=localidad.get("region", ""),
        temporada=localidad.get("temporada", ""),
        risk_score=localidad.get("risk_score", 0.0),
        risk_level=localidad.get("risk_level", "low"),
        resumen=report.get("resumen", ""),
        factores=report.get("factores", []),
        recomendaciones=report.get("recomendaciones", []),
        contexto_regional=report.get("contexto_regional", ""),
        generated_at=datetime.now(timezone.utc).isoformat(),
    )
