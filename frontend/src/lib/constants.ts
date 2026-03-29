import type { RiskLevel, AlertCategory, TrendDirection } from "./types";

export const RISK_CONFIG: Record<
  RiskLevel,
  { color: string; label: string; glowColor: string; radius: number }
> = {
  low: {
    color: "#10B981",
    label: "BAJO",
    glowColor: "rgba(16,185,129,0.3)",
    radius: 5,
  },
  medium: {
    color: "#F59E0B",
    label: "MODERADO",
    glowColor: "rgba(245,158,11,0.3)",
    radius: 5,
  },
  high: {
    color: "#DC2626",
    label: "CRÍTICO",
    glowColor: "rgba(220,38,38,0.4)",
    radius: 6,
  },
};

export const FEATURE_LABELS: Record<string, string> = {
  dist_zona_endemica_km: "Distancia a zona endémica",
  temp_media_invierno: "Temp. media invernal",
  gdd_base10_primavera: "Grados-día primavera",
  heladas_count: "Días con heladas",
  heladas_severas_count: "Heladas severas (<-6°C)",
  oni_invierno: "Índice ENSO (ONI)",
  precip_total_invierno: "Precipitación invernal",
  precip_total_primavera: "Precipitación primavera",
  wind_norte_ratio: "Ratio viento norte",
  dias_tmin_gt_15: "Días con mín. >15°C",
  dias_tmin_gt_18: "Días con mín. >18°C",
  temp_min_abs: "Temp. mínima absoluta",
  temp_media_primavera: "Temp. media primavera",
  gdd_base10: "Grados-día invierno",
  wind_mean_invierno: "Viento medio invernal",
  rh_mean_invierno: "Humedad relativa invernal",
  n_outbreaks_within_100km: "Brotes en 100km",
  n_outbreaks_within_200km: "Brotes en 200km",
  dist_nearest_outbreak_km: "Dist. brote más cercano",
  prev_max_capturas: "Capturas máx. temporada ant.",
  prev_target: "Brote temporada anterior",
};

export const FEATURE_UNITS: Record<string, string> = {
  dist_zona_endemica_km: "km",
  temp_media_invierno: "°C",
  temp_min_media_invierno: "°C",
  temp_media_primavera: "°C",
  temp_min_media_primavera: "°C",
  temp_min_abs: "°C",
  heladas_count: "d",
  heladas_severas_count: "d",
  dias_tmin_gt_10: "d",
  dias_tmin_gt_15: "d",
  dias_tmin_gt_18: "d",
  dias_tmin_gt_15_primavera: "d",
  dias_tmin_gt_18_primavera: "d",
  gdd_base10: "GDD",
  gdd_base10_primavera: "GDD",
  gdd_base0_negativo: "GDD",
  precip_total_invierno: "mm",
  precip_total_primavera: "mm",
  dias_con_lluvia: "d",
  rh_mean_invierno: "%",
  rh_mean_primavera: "%",
  wind_mean_invierno: "km/h",
  wind_max_invierno: "km/h",
  wind_mean_primavera: "km/h",
  wind_norte_ratio: "",
  oni_invierno: "",
  n_outbreaks_within_100km: "",
  n_outbreaks_within_200km: "",
  dist_nearest_outbreak_km: "km",
  dist_nearest_high_outbreak_km: "km",
  prev_max_capturas: "",
  prev_mean_capturas: "",
  prev_target: "",
  prev_n_detecciones: "",
  lat: "°",
  lon: "°",
};

export const REGION_CENTERS: Record<string, { lat: number; lon: number; zoom: number }> = {
  NOA: { lat: -26.5, lon: -65.5, zoom: 7 },
  NEA: { lat: -27.0, lon: -59.0, zoom: 7 },
  "CENTRO NORTE": { lat: -31.5, lon: -62.0, zoom: 7 },
  LITORAL: { lat: -32.0, lon: -60.5, zoom: 7 },
  "CENTRO SUR": { lat: -35.5, lon: -62.0, zoom: 7 },
  URUGUAY: { lat: -33.0, lon: -56.0, zoom: 7 },
};

// ---------------------------------------------------------------------------
// Monitoring
// ---------------------------------------------------------------------------

export const ALERT_CONFIG: Record<
  AlertCategory,
  { color: string; label: string; description: string }
> = {
  brote_riesgo_alto: {
    color: "#DC2626",
    label: "Brote + Riesgo Alto",
    description: "Brote activo, modelo predice continuidad",
  },
  brote_activo: {
    color: "#F97316",
    label: "Brote Activo",
    description: "Capturas altas, modelo no predice escalada",
  },
  alerta_vecinos: {
    color: "#F59E0B",
    label: "Alerta Vecinos",
    description: "Vecinos con capturas, riesgo de propagación",
  },
  bajo_riesgo: {
    color: "#10B981",
    label: "Bajo Riesgo",
    description: "Sin indicadores de alerta",
  },
};

export const TREND_CONFIG: Record<
  TrendDirection,
  { arrow: string; color: string; label: string }
> = {
  rising: { arrow: "↑", color: "#DC2626", label: "Subiendo" },
  stable: { arrow: "→", color: "#A8A29E", label: "Estable" },
  falling: { arrow: "↓", color: "#10B981", label: "Bajando" },
};

export const MONITORING_FEATURE_LABELS: Record<string, string> = {
  capturas_actual: "Capturas actuales",
  capturas_mean_actual: "Capturas promedio",
  capturas_prev: "Capturas previas",
  capturas_max_acum: "Capturas máx. acumuladas",
  capturas_mean_acum: "Capturas prom. acumuladas",
  capturas_trend: "Tendencia de capturas",
  capturas_log1p: "Capturas (log)",
  n_readings_season: "Lecturas en temporada",
  n_detecciones_acum: "Detecciones acumuladas",
  ratio_detecciones: "Ratio de detecciones",
  is_currently_outbreak: "Brote actual",
  n_trampas: "Nro. de trampas",
  max_capturas_50km: "Máx. capturas 50km",
  max_capturas_100km: "Máx. capturas 100km",
  max_capturas_200km: "Máx. capturas 200km",
  mean_capturas_100km: "Prom. capturas 100km",
  mean_capturas_200km: "Prom. capturas 200km",
  n_outbreak_50km: "Brotes en 50km",
  n_outbreak_100km: "Brotes en 100km",
  n_outbreak_200km: "Brotes en 200km",
  n_neighbors_100km: "Vecinos en 100km",
  n_neighbors_200km: "Vecinos en 200km",
  weighted_capturas_100km: "Capturas ponderadas 100km",
  propagation_pressure: "Presión de propagación",
  temp_mean_period: "Temp. media del período",
  temp_max_period: "Temp. máxima del período",
  temp_min_period: "Temp. mínima del período",
  temp_range_period: "Amplitud térmica",
  gdd_base10_period: "Grados-día del período",
  dias_tmin_gt_15: "Días con mín. >15°C",
  dias_tmin_gt_18: "Días con mín. >18°C",
  rh_mean_period: "Humedad relativa media",
  precip_total_period: "Precipitación del período",
  dias_lluvia_period: "Días con lluvia",
  wind_mean_period: "Viento medio",
  wind_max_period: "Viento máximo",
  wind_norte_ratio_period: "Ratio viento norte",
  day_of_year_sin: "Posición estacional (sin)",
  day_of_year_cos: "Posición estacional (cos)",
  month: "Mes",
  week_of_year: "Semana del año",
  dist_zona_endemica_km: "Distancia zona endémica",
  lat: "Latitud",
  lon: "Longitud",
};

export const ARGENTINA_CENTER: [number, number] = [-34.5, -63.0];
export const ARGENTINA_ZOOM = 5;

// SVG map viewBox dimensions
export const MAP_VIEWBOX_WIDTH = 800;
export const MAP_VIEWBOX_HEIGHT = 1000;

// Region zoom scales for SVG map (replaces Leaflet zoom levels)
export const REGION_ZOOM_SCALE: Record<string, number> = {
  NOA: 2.8,
  NEA: 2.8,
  "CENTRO NORTE": 3.0,
  LITORAL: 3.2,
  "CENTRO SUR": 2.8,
  URUGUAY: 3.0,
};
