# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Delphi is a predictive intelligence platform for corn leafhopper (*Dalbulus maidis*) outbreak risk in Argentina. It has two subsystems: an offline ML pipeline (`src/`, `train.py`) and a FastAPI serving backend (`backend/`). The backend serves precomputed risk scores from JSON files in memory — no database.

## Common Commands

### Offline Pipeline (data preparation)
```bash
python -m src.pipeline --stage load       # Parse 38 INTA trap CSVs → output/trap_data_clean.csv
python -m src.pipeline --stage geocode    # Geocode localities → cache/geocoding.json
python -m src.pipeline --stage assemble   # Fetch weather + build features → output/dataset.csv
```

### Model Training
```bash
python train.py    # Train XGBoost → output/model.json + output/shap_summary.png
```

### Generate Serving Artifacts
```bash
python -m backend.scripts.precompute_scores \
  --dataset output/dataset.csv \
  --model output/model.json \
  --scores-out output/scores_map.json \
  --metadata-out output/metadata.json \
  --artifact-version 2026-03-28
```

### Run Backend
```bash
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Smoke Test
```bash
python -m backend.scripts.smoke_test    # Hits /health, /metadata, /scores, /localidades/{id}
```

## Architecture

```
Offline Pipeline (src/)                    Serving (backend/)
━━━━━━━━━━━━━━━━━━━━━                    ━━━━━━━━━━━━━━━━━━
csvs/*.csv (38 reports)                    scores_map.json ──► DataStore (in-memory)
    │                                      metadata.json   ──┘       │
    ▼                                                                ▼
src/data/load.py → clean.py                FastAPI app (backend/app/main.py)
    │                                      ├── GET /health
    ▼                                      ├── GET /scores (filters: temporada, region, risk_level, min_risk)
src/geocoding/geocode.py (Nominatim)       ├── GET /localidades/{id} (detail + top_features)
    │                                      └── GET /metadata
    ▼
src/features/assemble.py
    ├── src/weather/historical.py (Open-Meteo API, cached as parquet)
    ├── src/weather/enso.py (NOAA ONI index)
    ├── src/features/climate.py (16 winter + 8 spring features)
    └── src/features/geographic.py (distance to endemic zone + neighbor outbreaks)
    │
    ▼
output/dataset.csv (831 rows × 37 cols)
    │
train.py (XGBClassifier) → output/model.json
    │
backend/scripts/precompute_scores.py → output/scores_map.json + metadata.json
```

## Key Design Decisions

- **Precomputed serving**: The backend loads `scores_map.json` and `metadata.json` into memory at startup. No model inference at request time. This keeps the serving layer fast and free of external API dependencies.
- **Temporal train/test split**: Model trains on 2024-2025 season, tests on 2025-2026. Never random split — always temporal.
- **Binary target**: `max_capturas >= 5` adults/trap in a season = outbreak (1). Threshold defined in `src/config.py` as `CAPTURE_THRESHOLD`.
- **Risk levels**: score < 0.35 = low, 0.35-0.65 = medium, >= 0.65 = high (in `backend/app/services/scoring.py`).
- **API contract is frozen** in `backend/CONTRACT.md`. Do not change response schemas without updating the contract.

## Key Configuration

- `src/config.py`: Pipeline constants (paths, seasons, weather variables, endemic zone coordinates, locality name normalization)
- `backend/app/settings.py`: Pydantic Settings loaded from env vars / `.env` file (see `backend/.env.example`)
- `backend/railway.json`: Railway.app deployment config (NIXPACKS builder)

## Dependencies

- Root `requirements.txt`: full pipeline + backend (pandas, numpy, xgboost, scikit-learn, shap, requests, pyarrow, matplotlib, fastapi, uvicorn, pydantic-settings)
- `backend/requirements.txt`: serving only (fastapi, uvicorn, pandas, xgboost, pydantic-settings)

## Domain Context

- **Organism**: *Dalbulus maidis* (corn leafhopper), vector of corn stunt disease
- **Data source**: INTA National Trap Monitoring Network (38 biweekly PDF reports, scraped to CSVs in `csvs/`)
- **Seasons**: July year N to June year N+1. Currently 2 seasons: 2024-2025 (reports 1-21) and 2025-2026 (reports 22-38)
- **Endemic zone reference**: INTA Famaillá, Tucumán (-26.8, -65.2)
- **External APIs** (all free, no keys): Open-Meteo Historical Weather, NOAA ONI/ENSO, Nominatim geocoding
