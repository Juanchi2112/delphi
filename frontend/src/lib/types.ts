export type RiskLevel = "low" | "medium" | "high";

export interface ScoreItem {
  id: string;
  localidad: string;
  provincia: string;
  region: string;
  temporada: string;
  lat: number;
  lon: number;
  risk_score: number;
  risk_level: RiskLevel;
  target_hist: number | null;
}

export interface FeatureValue {
  name: string;
  value: number | null;
}

export interface ShapFeature {
  name: string;
  value: number | null;
  shap_value: number;
}

export interface LocalidadDetail extends ScoreItem {
  max_capturas: number | null;
  mean_capturas: number | null;
  n_lecturas: number | null;
  n_detecciones: number | null;
  top_features: FeatureValue[];
  shap_features?: ShapFeature[];
  shap_base_value?: number | null;
}

export interface ScoresFilters {
  temporada: string | null;
  region: string | null;
  risk_level: RiskLevel | null;
  min_risk: number | null;
  limit: number;
}

export interface ScoresResponse {
  items: ScoreItem[];
  count: number;
  filters: ScoresFilters;
}

export interface MetadataResponse {
  api_version: string;
  artifact_version: string;
  generated_at: string | null;
  records_total: number;
  records_valid: number;
  records_discarded: number;
  discard_reasons: Record<string, number>;
  seasons_available: string[];
  regions_available: string[];
}

export interface ReportFactor {
  factor: string;
  impacto: string;
  explicacion: string;
}

export interface ReportRecommendation {
  categoria: string;
  accion: string;
  justificacion: string;
  prioridad: string;
}

export interface ReportResponse {
  localidad: string;
  provincia: string;
  region: string;
  temporada: string;
  risk_score: number;
  risk_level: string;
  resumen: string;
  factores: ReportFactor[];
  recomendaciones: ReportRecommendation[];
  contexto_regional: string;
  generated_at: string;
}

// ---------------------------------------------------------------------------
// Monitoring (14-day model)
// ---------------------------------------------------------------------------

export type AlertCategory =
  | "brote_riesgo_alto"
  | "alerta_vecinos"
  | "brote_activo"
  | "bajo_riesgo";

export type TrendDirection = "rising" | "stable" | "falling";

export interface MonitoringScoreItem {
  id: string;
  localidad_key: string;
  localidad: string;
  provincia: string;
  region: string;
  temporada: string;
  lat: number;
  lon: number;
  fecha_inicio: string;
  fecha_fin: string;
  quincena_index: number;
  risk_score: number;
  risk_level: RiskLevel;
  alert_category: AlertCategory;
  capturas_actual: number | null;
  is_currently_outbreak: boolean;
  trend: TrendDirection;
  trend_delta: number;
  neighbor_pressure: number | null;
}

export interface TimelineReading {
  quincena_index: number;
  fecha_inicio: string;
  fecha_fin: string;
  risk_score: number;
  risk_level: RiskLevel;
  alert_category: AlertCategory;
  capturas_actual: number | null;
  trend: TrendDirection;
  trend_delta: number;
}

export interface MonitoringLocalidadDetail extends MonitoringScoreItem {
  top_features: FeatureValue[];
  shap_features?: ShapFeature[];
  shap_base_value?: number | null;
  timeline: TimelineReading[];
}

export interface MonitoringScoresResponse {
  items: MonitoringScoreItem[];
  count: number;
  filters: Record<string, unknown>;
}

export interface AlertSummaryItem {
  category: AlertCategory;
  count: number;
  top_localities: MonitoringScoreItem[];
}

export interface AlertsResponse {
  temporada: string;
  total_localities: number;
  alerts: AlertSummaryItem[];
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

export interface HealthResponse {
  status: "ok";
  api_version: string;
  artifact_version: string;
  generated_at: string | null;
  timestamp: string;
  records_loaded: number;
  seasons_available: string[];
}
