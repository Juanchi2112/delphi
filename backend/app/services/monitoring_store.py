from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from fastapi import HTTPException


def _read_json(path: Path) -> Any:
    if not path.exists():
        raise FileNotFoundError(f"Required file not found: {path}")
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


@dataclass
class MonitoringStore:
    items: list[dict[str, Any]]
    timelines: dict[str, dict[str, Any]]
    metadata: dict[str, Any]
    by_id: dict[str, dict[str, Any]]

    @classmethod
    def from_files(cls, scores_path: Path, metadata_path: Path) -> "MonitoringStore":
        data = _read_json(scores_path)
        items = data["items"]
        timelines = data.get("timelines", {})
        metadata = _read_json(metadata_path)
        by_id = {item["id"]: item for item in items}
        return cls(items=items, timelines=timelines, metadata=metadata, by_id=by_id)

    def get_latest_scores(
        self,
        temporada: str | None,
        region: str | None,
        risk_level: str | None,
        alert_category: str | None,
        min_risk: float | None,
        limit: int,
    ) -> list[dict[str, Any]]:
        """Return the latest reading per locality, with optional filters."""
        results: list[dict[str, Any]] = []

        for _key, timeline in self.timelines.items():
            latest = timeline.get("latest")
            if latest is None:
                continue

            if temporada and latest.get("temporada") != temporada:
                continue
            if region:
                region_norm = region.strip().upper()
                if str(latest.get("region", "")).upper() != region_norm:
                    continue
            if risk_level:
                if str(latest.get("risk_level", "")).lower() != risk_level.strip().lower():
                    continue
            if alert_category:
                if latest.get("alert_category") != alert_category:
                    continue
            if min_risk is not None:
                if float(latest.get("risk_score", 0.0)) < min_risk:
                    continue

            results.append(latest)

        results.sort(key=lambda x: float(x.get("risk_score", 0.0)), reverse=True)
        return results[:limit]

    def get_localidad_detail(self, localidad_key: str) -> dict[str, Any]:
        """Full timeline + SHAP detail for latest reading."""
        timeline = self.timelines.get(localidad_key)
        if timeline is None:
            raise HTTPException(status_code=404, detail="Localidad key not found")

        latest = dict(timeline["latest"])
        latest["timeline"] = timeline.get("readings", [])
        return latest

    def get_alerts_summary(self, temporada: str | None) -> dict[str, Any]:
        """Aggregate alerts by category from latest readings."""
        categories: dict[str, list[dict[str, Any]]] = {}

        for _key, timeline in self.timelines.items():
            latest = timeline.get("latest")
            if latest is None:
                continue
            if temporada and latest.get("temporada") != temporada:
                continue

            cat = latest.get("alert_category", "bajo_riesgo")
            categories.setdefault(cat, []).append(latest)

        alerts = []
        for cat, items in categories.items():
            items_sorted = sorted(items, key=lambda x: float(x.get("risk_score", 0.0)), reverse=True)
            alerts.append({
                "category": cat,
                "count": len(items_sorted),
                "top_localities": items_sorted[:5],
            })

        alerts.sort(key=lambda x: x["count"], reverse=True)

        all_temporadas = {
            t["latest"].get("temporada")
            for t in self.timelines.values()
            if t.get("latest")
        }
        effective_temporada = temporada or (max(all_temporadas) if all_temporadas else "")

        total_localities = sum(a["count"] for a in alerts)
        return {
            "temporada": effective_temporada,
            "total_localities": total_localities,
            "alerts": alerts,
        }

    def get_monitoring_metadata(self, api_version: str, artifact_version: str) -> dict[str, Any]:
        payload = dict(self.metadata)
        payload["api_version"] = api_version
        payload["artifact_version"] = artifact_version
        return payload
