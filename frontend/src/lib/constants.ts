import type { RiskLevel } from "./types";

export const RISK_CONFIG: Record<
  RiskLevel,
  { color: string; label: string; glowColor: string; radius: number }
> = {
  low: {
    color: "#10B981",
    label: "BAJO",
    glowColor: "rgba(16,185,129,0.3)",
    radius: 4,
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

export const REGION_CENTERS: Record<string, { lat: number; lon: number; zoom: number }> = {
  NOA: { lat: -26.5, lon: -65.5, zoom: 7 },
  NEA: { lat: -27.0, lon: -59.0, zoom: 7 },
  "CENTRO NORTE": { lat: -31.5, lon: -62.0, zoom: 7 },
  LITORAL: { lat: -32.0, lon: -60.5, zoom: 7 },
  "CENTRO SUR": { lat: -35.5, lon: -62.0, zoom: 7 },
  URUGUAY: { lat: -33.0, lon: -56.0, zoom: 7 },
};

export const ARGENTINA_CENTER: [number, number] = [-34.5, -63.0];
export const ARGENTINA_ZOOM = 5;
