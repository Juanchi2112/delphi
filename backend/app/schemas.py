from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

RiskLevel = Literal["low", "medium", "high"]


class FeatureValue(BaseModel):
    name: str
    value: float | None = None


class ScoreItem(BaseModel):
    id: str
    localidad: str
    provincia: str
    region: str
    temporada: str
    lat: float
    lon: float
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_level: RiskLevel
    target_hist: int | None = None


class ScoresFilters(BaseModel):
    temporada: str | None = None
    region: str | None = None
    risk_level: RiskLevel | None = None
    min_risk: float | None = None
    limit: int


class ScoresResponse(BaseModel):
    items: list[ScoreItem]
    count: int
    filters: ScoresFilters


class LocalidadDetail(ScoreItem):
    max_capturas: float | None = None
    mean_capturas: float | None = None
    n_lecturas: int | None = None
    n_detecciones: int | None = None
    top_features: list[FeatureValue] = []


class HealthResponse(BaseModel):
    status: Literal["ok"]
    api_version: str
    artifact_version: str
    generated_at: datetime | None = None
    timestamp: datetime
    records_loaded: int
    seasons_available: list[str]


class MetadataResponse(BaseModel):
    api_version: str
    artifact_version: str
    generated_at: datetime | None = None
    records_total: int
    records_valid: int
    records_discarded: int
    discard_reasons: dict[str, int]
    seasons_available: list[str]
    regions_available: list[str]
