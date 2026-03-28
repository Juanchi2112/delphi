from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routers.health import router as health_router
from backend.app.routers.localidades import router as localidades_router
from backend.app.routers.metadata import router as metadata_router
from backend.app.routers.scores import router as scores_router
from backend.app.settings import get_settings

settings = get_settings()

app = FastAPI(
    title="ChicharritAI Backend API",
    version=settings.api_version,
    description="Serving API for precomputed pest outbreak risk scores.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(scores_router)
app.include_router(localidades_router)
app.include_router(metadata_router)


@app.get("/", tags=["root"])
def root() -> dict[str, str]:
    return {
        "name": "ChicharritAI Backend API",
        "version": settings.api_version,
        "status": "ok",
    }
