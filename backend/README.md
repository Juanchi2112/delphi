# Backend (FastAPI)

Serving API for precomputed outbreak risk scores.

## Install

```bash
pip install -r backend/requirements.txt
```

## Precompute artifacts

```bash
python -m backend.scripts.precompute_scores \
  --dataset output/dataset.csv \
  --model output/model.json \
  --scores-out output/scores_map.json \
  --metadata-out output/metadata.json
```

## Run

```bash
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Smoke test

```bash
python -m backend.scripts.smoke_test
```

## Endpoints

- `GET /health`
- `GET /scores`
- `GET /localidades/{id}`
- `GET /metadata`

Contract: `backend/CONTRACT.md`
