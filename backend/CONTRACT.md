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
