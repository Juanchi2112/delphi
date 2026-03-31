# Delphi

Predictive intelligence platform for agricultural pest outbreaks in Argentina.

Delphi helps anticipate maize leafhopper (*Dalbulus maidis*) risk before damage occurs. It combines trap monitoring data, climate variables, and geospatial analysis to generate early warnings and support better planting decisions.

[Live demo](https://frontend-lac-three-63.vercel.app/) | [3-minute presentation video](docs/videos/delphi-presentation.mp4) | [API contract](backend/CONTRACT.md)

> Winner of the AI & Automatizations category at HackITBA 2026.

## Overview

- Pre-season outbreak risk scoring across Argentina
- 14-day tactical monitoring based on recent captures and local spread
- Explainable predictions with SHAP-based feature contributions
- Interactive map and locality-level drill-down for decision support

The platform is built on real climate data and biweekly monitoring reports from the INTA National Trap Monitoring Network, covering 330+ traps and 38 reports across two seasons.

## What Delphi Does

- Predicts outbreak risk before sowing using historical climate and geographic features
- Tracks short-term changes in risk using recent monitoring, weather, and neighborhood propagation signals
- Surfaces locality-specific risk drivers instead of returning a black-box score
- Makes the results explorable through a web app with maps, timelines, and AI-generated reports

## Presentation Video

A 3-minute walkthrough of the problem, the proposed solution, and a short live product demo: [watch the presentation](docs/videos/delphi-presentation.mp4).

## Architecture

```text
Offline Pipeline (src/)              Backend (backend/)               Frontend (frontend/)
-----------------------             ------------------               ---------------------
csvs/*.csv (38 reports)              scores_map.json ---+            Next.js + React
    |                                metadata.json  ----|            Map + timelines
    v                                monitoring_*.json -+            Supabase (auth + fields)
src/pipeline -> features                    |                        Vercel deployment
    |                                FastAPI (in-memory)
    v                                |- /scores
train.py -> model.json               |- /localidades/{id}
    |                                |- /monitoring/*
    v                                |- /informes (AI reports)
precompute_scores.py                 +- Railway deployment
precompute_monitoring.py
```

## Repository Layout

```text
|-- src/                  Data pipeline (load, geocode, features)
|-- train.py              Trains the XGBoost model
|-- backend/
|   |-- app/              FastAPI app (routers, services, schemas)
|   `-- scripts/          precompute_scores.py, precompute_monitoring.py
|-- frontend/             Next.js 16 + React 19 + Tailwind
|   `-- src/
|       |-- app/          Pages (landing, dashboard, login)
|       |-- components/   Map, detail panels, monitoring, onboarding
|       |-- stores/       Zustand stores
|       `-- lib/          API client, types, constants
|-- notebooks/            EDA, modeling, analysis
|-- csvs/                 38 CSV reports from the monitoring network
`-- output/               Generated artifacts (scores, metadata)
```

## Quick Start

### Backend

```bash
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Backend API

### Pre-season static scores

- `GET /health` - status and metadata
- `GET /scores` - locality scores with filters for season, region, risk level, and minimum risk
- `GET /localidades/{id}` - locality detail plus SHAP explainability
- `GET /metadata` - dataset statistics

### Biweekly monitoring

- `GET /monitoring/scores` - latest reading per locality
- `GET /monitoring/localidades/{key}` - full monitoring timeline plus SHAP
- `GET /monitoring/alerts` - alert summary by category
- `GET /monitoring/metadata` - monitoring dataset statistics

### AI reports

- `POST /informes/{localidad_id}` - generates an AI risk report with OpenAI

See the full contract in `backend/CONTRACT.md`.

## Deployment

- Backend: Railway (Nixpacks, auto-deploy from `main`)
- Frontend: Vercel (auto-deploy from `main`, root directory `frontend`)

### Railway environment variables

```env
API_VERSION=v1
ARTIFACT_VERSION=2026-03-29
SCORES_PATH=output/scores_map.json
METADATA_PATH=output/metadata.json
MONITORING_SCORES_PATH=output/monitoring_map.json
MONITORING_METADATA_PATH=output/monitoring_metadata.json
OPENAI_API_KEY=sk-...
```

## Generating Artifacts

```bash
# Data pipeline
python -m src.pipeline --stage load
python -m src.pipeline --stage geocode
python -m src.pipeline --stage assemble

# Train model
python train.py

# Pre-season scores
python -m backend.scripts.precompute_scores

# Biweekly monitoring scores
python -m backend.scripts.precompute_monitoring
```

## Team

HackITBA 2026 - Delphi team (Juanchi, Ana Paula, Nacho, Alex)  
Universidad de San Andres - AI Engineering

<p align="center">
  <img src="docs/images/delphi-team.jpeg" alt="Delphi team at HackITBA 2026" width="820" />
</p>
