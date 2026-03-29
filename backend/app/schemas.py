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


class ShapFeature(BaseModel):
    name: str
    value: float | None = None
    shap_value: float = 0.0


class LocalidadDetail(ScoreItem):
    max_capturas: float | None = None
    mean_capturas: float | None = None
    n_lecturas: int | None = None
    n_detecciones: int | None = None
    top_features: list[FeatureValue] = []
    shap_features: list[ShapFeature] = []
    shap_base_value: float | None = None


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


# ---------------------------------------------------------------------------
# Monitoring (14-day model)
# ---------------------------------------------------------------------------

AlertCategory = Literal[
    "brote_riesgo_alto", "alerta_vecinos", "brote_activo", "bajo_riesgo"
]
TrendDirection = Literal["rising", "stable", "falling"]


class MonitoringScoreItem(BaseModel):
    id: str
    localidad_key: str
    localidad: str
    provincia: str
    region: str
    temporada: str
    lat: float
    lon: float
    fecha_inicio: str
    fecha_fin: str
    quincena_index: int
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_level: RiskLevel
    alert_category: AlertCategory
    capturas_actual: float | None = None
    is_currently_outbreak: bool = False
    trend: TrendDirection = "stable"
    trend_delta: float = 0.0
    neighbor_pressure: float | None = None


class MonitoringScoresResponse(BaseModel):
    items: list[MonitoringScoreItem]
    count: int
    filters: dict


class TimelineReading(BaseModel):
    quincena_index: int
    fecha_inicio: str
    fecha_fin: str
    risk_score: float
    risk_level: RiskLevel
    alert_category: AlertCategory
    capturas_actual: float | None = None
    trend: TrendDirection = "stable"
    trend_delta: float = 0.0


class MonitoringLocalidadDetail(MonitoringScoreItem):
    top_features: list[FeatureValue] = []
    shap_features: list[ShapFeature] = []
    shap_base_value: float | None = None
    timeline: list[TimelineReading] = []


class AlertSummaryItem(BaseModel):
    category: AlertCategory
    count: int
    top_localities: list[MonitoringScoreItem] = []


class AlertsResponse(BaseModel):
    temporada: str
    total_localities: int
    alerts: list[AlertSummaryItem]


class MonitoringMetadataResponse(BaseModel):
    api_version: str
    artifact_version: str
    generated_at: str | None = None
    records_total: int
    records_valid: int
    localities_count: int
    readings_per_locality_avg: float
    seasons_available: list[str]
    regions_available: list[str]
    date_range_start: str | None = None
    date_range_end: str | None = None


# ---------------------------------------------------------------------------
# Reports
# ---------------------------------------------------------------------------

class ReportRequest(BaseModel):
    campo_nombre: str | None = None
    hectareas: float | None = None


class ReportFactor(BaseModel):
    factor: str
    impacto: str
    explicacion: str


class ReportRecommendation(BaseModel):
    categoria: str
    accion: str
    justificacion: str
    prioridad: str


class ReportResponse(BaseModel):
    localidad: str
    provincia: str
    region: str
    temporada: str
    risk_score: float
    risk_level: str
    resumen: str
    factores: list[ReportFactor]
    recomendaciones: list[ReportRecommendation]
    contexto_regional: str
    generated_at: str
