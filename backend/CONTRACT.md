# Backend API Contract v1

This document freezes the response contract consumed by the frontend map demo.

## General

- Base path: `/`
- Content type: `application/json`
- Time values use ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`)
- `risk_score` is always a float between `0.0` and `1.0`
- `risk_level` thresholds:
  - `low`: `< 0.35`
  - `medium`: `>= 0.35 and < 0.65`
  - `high`: `>= 0.65`

## GET /health

### Response 200

```json
{
  "status": "ok",
  "api_version": "v1",
  "artifact_version": "2026-03-28",
  "generated_at": "2026-03-28T20:30:00Z",
  "timestamp": "2026-03-28T20:45:00Z",
  "records_loaded": 741,
  "seasons_available": ["2024-2025", "2025-2026"]
}
```

## GET /scores

### Query params

- `temporada` (optional, string)
- `region` (optional, string)
- `risk_level` (optional, enum `low|medium|high`)
- `min_risk` (optional, float 0-1)
- `limit` (optional, int, default 5000, max 20000)

### Response 200

```json
{
  "items": [
    {
      "id": "achiras-cordoba-2025-2026-0001",
      "localidad": "Achiras",
      "provincia": "Cordoba",
      "region": "CENTRO SUR",
      "temporada": "2025-2026",
      "lat": -33.1745,
      "lon": -64.9920,
      "risk_score": 0.4123,
      "risk_level": "medium",
      "target_hist": 0
    }
  ],
  "count": 1,
  "filters": {
    "temporada": "2025-2026",
    "region": null,
    "risk_level": null,
    "min_risk": null,
    "limit": 5000
  }
}
```

## GET /localidades/{id}

### Response 200

```json
{
  "id": "achiras-cordoba-2025-2026-0001",
  "localidad": "Achiras",
  "provincia": "Cordoba",
  "region": "CENTRO SUR",
  "temporada": "2025-2026",
  "lat": -33.1745,
  "lon": -64.9920,
  "risk_score": 0.4123,
  "risk_level": "medium",
  "target_hist": 0,
  "max_capturas": 0.0,
  "mean_capturas": 0.0,
  "n_lecturas": 2,
  "n_detecciones": 0,
  "top_features": [
    {"name": "dist_zona_endemica_km", "value": 709.09},
    {"name": "temp_media_invierno", "value": 8.97},
    {"name": "gdd_base10_primavera", "value": 317.0}
  ],
  "shap_base_value": 0.4739,
  "shap_features": [
    {"name": "dist_zona_endemica_km", "value": 709.09, "shap_value": 0.068},
    {"name": "lat", "value": -33.17, "shap_value": 0.11},
    {"name": "lon", "value": -64.99, "shap_value": -0.05},
    {"name": "temp_media_invierno", "value": 8.97, "shap_value": -0.02}
  ]
}
```

### Response 404

```json
{
  "detail": "Localidad id not found"
}
```

## GET /metadata

### Response 200

```json
{
  "api_version": "v1",
  "artifact_version": "2026-03-28",
  "generated_at": "2026-03-28T20:30:00Z",
  "records_total": 831,
  "records_valid": 741,
  "records_discarded": 90,
  "discard_reasons": {
    "invalid_bbox": 4,
    "invalid_localidad": 55,
    "missing_coordinates": 31
  },
  "seasons_available": ["2024-2025", "2025-2026"],
  "regions_available": ["CENTRO SUR", "NEA", "NOA"]
}
```

---

## Monitoring Endpoints (14-day model)

### General

- `alert_category` values: `brote_riesgo_alto`, `alerta_vecinos`, `brote_activo`, `bajo_riesgo`
- `trend` values: `rising`, `stable`, `falling`
- `localidad_key` format: `{localidad}-{provincia}` (slugified)

## GET /monitoring/scores

Latest reading per locality for map display.

### Query params

- `temporada` (optional, string)
- `region` (optional, string)
- `risk_level` (optional, enum `low|medium|high`)
- `alert_category` (optional, enum)
- `min_risk` (optional, float 0-1)
- `limit` (optional, int, default 5000, max 20000)

### Response 200

```json
{
  "items": [
    {
      "id": "achiras-cordoba-2025-2026-q07",
      "localidad_key": "achiras-cordoba",
      "localidad": "Achiras",
      "provincia": "Cordoba",
      "region": "CENTRO SUR",
      "temporada": "2025-2026",
      "lat": -33.1745,
      "lon": -64.9920,
      "fecha_inicio": "2025-11-01",
      "fecha_fin": "2025-11-14",
      "quincena_index": 7,
      "risk_score": 0.4123,
      "risk_level": "medium",
      "alert_category": "bajo_riesgo",
      "capturas_actual": 2.0,
      "is_currently_outbreak": false,
      "trend": "stable",
      "trend_delta": 0.02,
      "neighbor_pressure": 0.15
    }
  ],
  "count": 1,
  "filters": {
    "temporada": "2025-2026",
    "region": null,
    "risk_level": null,
    "alert_category": null,
    "min_risk": null,
    "limit": 5000
  }
}
```

## GET /monitoring/localidades/{localidad_key}

Full detail + timeline for a locality.

### Response 200

```json
{
  "id": "achiras-cordoba-2025-2026-q07",
  "localidad_key": "achiras-cordoba",
  "localidad": "Achiras",
  "provincia": "Cordoba",
  "region": "CENTRO SUR",
  "temporada": "2025-2026",
  "lat": -33.1745,
  "lon": -64.9920,
  "fecha_inicio": "2025-11-01",
  "fecha_fin": "2025-11-14",
  "quincena_index": 7,
  "risk_score": 0.4123,
  "risk_level": "medium",
  "alert_category": "bajo_riesgo",
  "capturas_actual": 2.0,
  "is_currently_outbreak": false,
  "trend": "stable",
  "trend_delta": 0.02,
  "neighbor_pressure": 0.15,
  "top_features": [
    {"name": "capturas_actual", "value": 2.0},
    {"name": "propagation_pressure", "value": 0.15},
    {"name": "temp_mean_period", "value": 22.5}
  ],
  "shap_base_value": 0.45,
  "shap_features": [
    {"name": "capturas_actual", "value": 2.0, "shap_value": -0.12},
    {"name": "propagation_pressure", "value": 0.15, "shap_value": -0.08}
  ],
  "timeline": [
    {
      "quincena_index": 1,
      "fecha_inicio": "2025-07-15",
      "fecha_fin": "2025-07-28",
      "risk_score": 0.12,
      "risk_level": "low",
      "alert_category": "bajo_riesgo",
      "capturas_actual": 0.0,
      "trend": "stable",
      "trend_delta": 0.0
    }
  ]
}
```

### Response 404

```json
{
  "detail": "Localidad key not found"
}
```

## GET /monitoring/alerts

Aggregated alert summary by category.

### Query params

- `temporada` (optional, string)

### Response 200

```json
{
  "temporada": "2025-2026",
  "total_localities": 250,
  "alerts": [
    {
      "category": "bajo_riesgo",
      "count": 180,
      "top_localities": []
    },
    {
      "category": "brote_riesgo_alto",
      "count": 25,
      "top_localities": []
    },
    {
      "category": "alerta_vecinos",
      "count": 30,
      "top_localities": []
    },
    {
      "category": "brote_activo",
      "count": 15,
      "top_localities": []
    }
  ]
}
```

## GET /monitoring/metadata

### Response 200

```json
{
  "api_version": "v1",
  "artifact_version": "2026-03-29",
  "generated_at": "2026-03-29T10:00:00Z",
  "records_total": 3500,
  "records_valid": 3200,
  "localities_count": 250,
  "readings_per_locality_avg": 12.8,
  "seasons_available": ["2024-2025", "2025-2026"],
  "regions_available": ["CENTRO NORTE", "CENTRO SUR", "LITORAL", "NEA", "NOA", "URUGUAY"],
  "date_range_start": "2024-07-15",
  "date_range_end": "2026-03-16"
}
```
