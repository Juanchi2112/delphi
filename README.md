# Delphi

Plataforma de inteligencia predictiva para riesgo de brote de chicharrita del maiz (*Dalbulus maidis*) en Argentina. Usa machine learning sobre datos climaticos reales y 330+ trampas de monitoreo del INTA.

## Arquitectura

```
Offline Pipeline (src/)              Backend (backend/)               Frontend (frontend/)
━━━━━━━━━━━━━━━━━━━━━               ━━━━━━━━━━━━━━━━━━               ━━━━━━━━━━━━━━━━━━━━
csvs/*.csv (38 informes)             scores_map.json ──┐              Next.js + React
    │                                metadata.json  ──┤              Leaflet (mapa)
    ▼                                monitoring_*.json─┘              Recharts (timeline)
src/pipeline → features                    │                          Supabase (auth + campos)
    │                                FastAPI (in-memory)                    │
    ▼                                ├── /scores                     Vercel (deploy)
train.py → model.json                ├── /localidades/{id}
    │                                ├── /monitoring/*
    ▼                                ├── /informes (AI reports)
precompute_scores.py                 └── Railway (deploy)
precompute_monitoring.py
```

## Layout del repositorio

```
├── src/                  Pipeline de datos (load, geocode, features)
├── train.py              Entrena modelo XGBoost
├── backend/
│   ├── app/              FastAPI (routers, services, schemas)
│   └── scripts/          precompute_scores.py, precompute_monitoring.py
├── frontend/             Next.js 16 + React 19 + Tailwind
│   └── src/
│       ├── app/          Pages (landing, dashboard, login)
│       ├── components/   Map, detail panels, monitoring, onboarding
│       ├── stores/       Zustand (map, auth, campos)
│       └── lib/          API client, types, constants
├── notebooks/            EDA, modelos, analisis
├── csvs/                 38 CSVs de la Red Nacional de Trampas
└── output/               Artifacts generados (scores, metadata)
```

## Setup rapido

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

Requiere `.env.local` en `frontend/`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Endpoints del backend

### Pre-campana (scores estaticos)
- `GET /health` — status + metadata
- `GET /scores` — scores por localidad (filtros: temporada, region, risk_level, min_risk)
- `GET /localidades/{id}` — detalle + SHAP explainability
- `GET /metadata` — stats del dataset

### Monitoreo quincenal (14 dias)
- `GET /monitoring/scores` — ultima lectura por localidad (filtros: temporada, region, alert_category)
- `GET /monitoring/localidades/{key}` — timeline completa + SHAP
- `GET /monitoring/alerts` — resumen de alertas por categoria
- `GET /monitoring/metadata` — stats del monitoreo

### Informes AI
- `POST /informes/{localidad_id}` — genera informe de riesgo con OpenAI

Contrato completo en `backend/CONTRACT.md`.

## Deploy

- **Backend**: Railway (Nixpacks, auto-deploy desde main)
- **Frontend**: Vercel (auto-deploy desde main, root directory: `frontend`)

### Variables de entorno (Railway)
```
API_VERSION=v1
ARTIFACT_VERSION=2026-03-29
SCORES_PATH=output/scores_map.json
METADATA_PATH=output/metadata.json
MONITORING_SCORES_PATH=output/monitoring_map.json
MONITORING_METADATA_PATH=output/monitoring_metadata.json
OPENAI_API_KEY=sk-...
```

## Generar artifacts (offline)

```bash
# Pipeline de datos
python -m src.pipeline --stage load
python -m src.pipeline --stage geocode
python -m src.pipeline --stage assemble

# Entrenar modelo
python train.py

# Pre-campana scores
python -m backend.scripts.precompute_scores

# Monitoreo quincenal scores
python -m backend.scripts.precompute_monitoring
```

## Equipo

HackITBA 2026 — Delphi team (Juanchi, AP, Nacho, Alex)
Universidad de San Andres, Ingenieria en AI
