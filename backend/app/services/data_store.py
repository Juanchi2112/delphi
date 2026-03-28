from __future__ import annotations

import json
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import HTTPException


def _read_json(path: Path) -> Any:
    if not path.exists():
        raise FileNotFoundError(f"Required file not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


@dataclass
class DataStore:
    scores_items: list[dict[str, Any]]
    metadata: dict[str, Any]
    by_id: dict[str, dict[str, Any]]

    @classmethod
    def from_files(cls, scores_path: Path, metadata_path: Path) -> "DataStore":
        scores_data = _read_json(scores_path)
        if isinstance(scores_data, dict) and "items" in scores_data:
            scores_items = scores_data["items"]
        elif isinstance(scores_data, list):
            scores_items = scores_data
        else:
            raise ValueError("scores_map.json must be a list or object with 'items'")

        metadata = _read_json(metadata_path)
        by_id = {item["id"]: item for item in scores_items}
        return cls(scores_items=scores_items, metadata=metadata, by_id=by_id)

    def health_snapshot(self, api_version: str, artifact_version: str) -> dict[str, Any]:
        seasons = sorted({item.get("temporada", "") for item in self.scores_items if item.get("temporada")})
        return {
            "status": "ok",
            "api_version": api_version,
            "artifact_version": artifact_version,
            "generated_at": self.metadata.get("generated_at"),
            "timestamp": datetime.now(timezone.utc),
            "records_loaded": len(self.scores_items),
            "seasons_available": seasons,
        }

    def get_metadata(self, api_version: str, artifact_version: str) -> dict[str, Any]:
        payload = dict(self.metadata)
        payload["api_version"] = api_version
        payload["artifact_version"] = artifact_version
        return payload

    def filter_scores(
        self,
        temporada: str | None,
        region: str | None,
        risk_level: str | None,
        min_risk: float | None,
        limit: int,
    ) -> list[dict[str, Any]]:
        items = self.scores_items

        if temporada:
            items = [x for x in items if x.get("temporada") == temporada]
        if region:
            region_norm = region.strip().upper()
            items = [x for x in items if str(x.get("region", "")).upper() == region_norm]
        if risk_level:
            risk_norm = risk_level.strip().lower()
            items = [x for x in items if str(x.get("risk_level", "")).lower() == risk_norm]
        if min_risk is not None:
            items = [x for x in items if float(x.get("risk_score", 0.0)) >= min_risk]

        # Highest risk first for map focus.
        items = sorted(items, key=lambda x: float(x.get("risk_score", 0.0)), reverse=True)
        return items[:limit]

    def get_localidad(self, loc_id: str) -> dict[str, Any]:
        item = self.by_id.get(loc_id)
        if item is None:
            raise HTTPException(status_code=404, detail="Localidad id not found")
        return item
