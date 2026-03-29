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

export interface HealthResponse {
  status: "ok";
  api_version: string;
  artifact_version: string;
  generated_at: string | null;
  timestamp: string;
  records_loaded: number;
  seasons_available: string[];
}
