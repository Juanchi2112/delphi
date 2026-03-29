# Delphi

Predictive intelligence platform for corn leafhopper (`Dalbulus maidis`) outbreak risk in Argentina.

This repository now separates:

- **Offline pipeline/training** (`src/`, `train.py`, notebooks) for data preparation.
- **Serving backend** (`backend/`) for deployable API used by the interactive map frontend.

## Quick Architecture

1. Build dataset and train model offline.
2. Generate precomputed serving artifacts (`scores_map.json`, `metadata.json`).
3. Run FastAPI backend that serves scores in-memory (no database required for MVP).

## Repository Layout

- `src/`: data pipeline, weather and feature engineering.
- `train.py`: trains XGBoost model, saves `output/model.json`.
- `backend/`: FastAPI service and precompute scripts for deployment.
- `output/`: generated artifacts (`dataset.csv`, `model.json`, `scores_map.json`, `metadata.json`).
- `01_eda.ipynb`, `02_modelo.ipynb`, `xgboost.ipynb`: exploratory/model notebooks.

## Requirements

- Python 3.10+
- pip

## 1) Offline pipeline (optional if artifacts already exist)

Generate clean trap data and final dataset:

```bash
python -m src.pipeline --stage load
python -m src.pipeline --stage geocode
python -m src.pipeline --stage assemble
```

Train model:

```bash
python train.py
```

Expected outputs:

- `output/dataset.csv`
- `output/model.json`

## 2) Generate serving artifacts

```bash
python -m backend.scripts.precompute_scores \
  --dataset output/dataset.csv \
  --model output/model.json \
  --scores-out output/scores_map.json \
  --metadata-out output/metadata.json \
  --artifact-version 2026-03-28
```

## 3) Run backend locally

Install backend dependencies:

```bash
pip install -r backend/requirements.txt
```

Start API:

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

Main endpoints:

- `GET /health`
- `GET /scores`
- `GET /localidades/{id}`
- `GET /metadata`

API contract is frozen in `backend/CONTRACT.md`.

## 4) Local smoke test

```bash
python -m backend.scripts.smoke_test
```

## 5) Railway deploy

### Recommended setup

1. Push repo to GitHub.
2. In Railway: **New Project -> Deploy from GitHub Repo**.
3. Keep root directory at repository root.
4. Set start command:

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT
```

5. Add env vars:

- `API_VERSION=v1`
- `ARTIFACT_VERSION=2026-03-28`
- `MODEL_PATH=output/model.json`
- `DATASET_PATH=output/dataset.csv`
- `SCORES_PATH=output/scores_map.json`
- `METADATA_PATH=output/metadata.json`

6. Deploy and verify:

- `/health`
- `/scores?temporada=2025-2026&limit=10`
- `/metadata`

## Demo Stability Notes

- Serving layer does not depend on external APIs at request time.
- Invalid map points are filtered during precompute (`invalid_bbox`, invalid locality names).
- Backend works as stateless API with in-memory JSON payload.

## Team

HackITBA 2026 - Delphi team.
