#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import math
import re
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import pandas as pd
import shap
import xgboost as xgb

from backend.app.services.scoring import to_risk_level

META_COLS = [
    "localidad",
    "provincia",
    "region",
    "temporada",
    "max_capturas",
    "mean_capturas",
    "n_lecturas",
    "n_detecciones",
    "target",
]

# Rough bbox for Argentina mainland demo filtering.
ARG_BBOX = {
    "min_lat": -56.0,
    "max_lat": -21.0,
    "min_lon": -76.0,
    "max_lon": -53.0,
}

FEATURE_PRIORITY = [
    "dist_zona_endemica_km",
    "temp_media_invierno",
    "gdd_base10_primavera",
    "precip_total_primavera",
    "wind_norte_ratio",
    "oni_invierno",
]


def iso_utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def norm_str(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and math.isnan(value):
        return ""
    return str(value).strip()


def sanitize_for_id(value: str) -> str:
    x = value.lower().strip()
    x = re.sub(r"[^a-z0-9]+", "-", x)
    x = re.sub(r"-+", "-", x).strip("-")
    return x or "unknown"


def is_valid_localidad(name: str) -> bool:
    if not name:
        return False
    lowered = name.lower().strip()
    if lowered in {"0", "1", "2", "nan", "none", "sin datos"}:
        return False
    if lowered.isdigit():
        return False
    if len(lowered) < 3:
        return False
    return True


def in_argentina_bbox(lat: float, lon: float) -> bool:
    return (
        ARG_BBOX["min_lat"] <= lat <= ARG_BBOX["max_lat"]
        and ARG_BBOX["min_lon"] <= lon <= ARG_BBOX["max_lon"]
    )


def safe_float(value: object) -> float | None:
    if value is None:
        return None
    try:
        v = float(value)
    except (ValueError, TypeError):
        return None
    if math.isnan(v):
        return None
    return v


def safe_int(value: object) -> int | None:
    if value is None:
        return None
    try:
        return int(value)
    except (ValueError, TypeError):
        return None


def build_top_features(row: pd.Series) -> list[dict[str, float | None]]:
    result: list[dict[str, float | None]] = []
    for feat in FEATURE_PRIORITY:
        if feat in row.index:
            result.append({"name": feat, "value": safe_float(row.get(feat))})
        if len(result) == 3:
            break
    return result


def sigmoid(x: float) -> float:
    if x >= 0:
        return 1.0 / (1.0 + math.exp(-x))
    ex = math.exp(x)
    return ex / (1.0 + ex)


def compute_shap_values(
    model_path: Path, df: pd.DataFrame, feature_cols: list[str]
) -> tuple[np.ndarray, float]:
    """Compute SHAP values using TreeExplainer on the XGBoost Booster."""
    booster = xgb.Booster()
    booster.load_model(str(model_path))
    explainer = shap.TreeExplainer(booster)
    dmatrix = xgb.DMatrix(df[feature_cols], feature_names=feature_cols)
    shap_values = explainer.shap_values(dmatrix)
    base_value = float(explainer.expected_value)
    return shap_values, base_value


def build_shap_features(
    row: pd.Series,
    shap_row: np.ndarray,
    feature_cols: list[str],
    base_logodds: float,
    top_k: int = 8,
) -> tuple[list[dict[str, object]], float]:
    """Build top-k SHAP features with contributions in probability space.

    Returns (features_list, base_probability).
    The shap_value of each feature is the delta in probability, so
    base_probability + sum(shap_values) ≈ risk_score.
    """
    base_prob = sigmoid(base_logodds)

    indices = np.argsort(np.abs(shap_row))[::-1]
    top_indices = indices[:top_k]
    rest_indices = indices[top_k:]

    cumulative_logodds = base_logodds
    result: list[dict[str, object]] = []

    for idx in top_indices:
        prev_prob = sigmoid(cumulative_logodds)
        cumulative_logodds += float(shap_row[idx])
        curr_prob = sigmoid(cumulative_logodds)
        delta_prob = curr_prob - prev_prob
        result.append({
            "name": feature_cols[idx],
            "value": safe_float(row[feature_cols[idx]]),
            "shap_value": round(delta_prob, 6),
        })

    if len(rest_indices) > 0:
        prev_prob = sigmoid(cumulative_logodds)
        rest_sum = float(shap_row[rest_indices].sum())
        cumulative_logodds += rest_sum
        curr_prob = sigmoid(cumulative_logodds)
        delta_rest = curr_prob - prev_prob
        if abs(delta_rest) > 0.001:
            result.append({
                "name": "_otros",
                "value": None,
                "shap_value": round(delta_rest, 6),
            })

    return result, round(base_prob, 6)


def load_model_scores(model_path: Path, df: pd.DataFrame, feature_cols: list[str]) -> list[float]:
    booster = xgb.Booster()
    booster.load_model(str(model_path))
    dmatrix = xgb.DMatrix(df[feature_cols], feature_names=feature_cols)
    preds = booster.predict(dmatrix)
    return [float(x) for x in preds]


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate precomputed map scores from dataset + model.")
    parser.add_argument("--dataset", type=Path, default=Path("output/dataset.csv"))
    parser.add_argument("--model", type=Path, default=Path("output/model.json"))
    parser.add_argument("--scores-out", type=Path, default=Path("output/scores_map.json"))
    parser.add_argument("--metadata-out", type=Path, default=Path("output/metadata.json"))
    parser.add_argument("--artifact-version", type=str, default=datetime.now().strftime("%Y-%m-%d"))
    args = parser.parse_args()

    df = pd.read_csv(args.dataset)
    feature_cols = [c for c in df.columns if c not in META_COLS]
    risk_scores = load_model_scores(args.model, df, feature_cols)
    shap_matrix, base_logodds = compute_shap_values(args.model, df, feature_cols)
    df = df.copy()
    df["risk_score"] = risk_scores
    df["risk_level"] = df["risk_score"].apply(to_risk_level)

    records_total = len(df)
    discard_reasons = {"invalid_bbox": 0, "invalid_localidad": 0, "missing_coordinates": 0}
    items: list[dict[str, object]] = []

    for idx, row in df.iterrows():
        localidad = norm_str(row.get("localidad"))
        provincia = norm_str(row.get("provincia")).title()
        region = norm_str(row.get("region")).upper()
        temporada = norm_str(row.get("temporada"))

        lat = safe_float(row.get("lat"))
        lon = safe_float(row.get("lon"))

        if lat is None or lon is None:
            discard_reasons["missing_coordinates"] += 1
            continue
        if not is_valid_localidad(localidad):
            discard_reasons["invalid_localidad"] += 1
            continue
        if not in_argentina_bbox(lat, lon):
            discard_reasons["invalid_bbox"] += 1
            continue

        loc_id = (
            f"{sanitize_for_id(localidad)}-"
            f"{sanitize_for_id(provincia)}-"
            f"{sanitize_for_id(temporada)}-"
            f"{idx:04d}"
        )

        shap_feats, base_prob = build_shap_features(
            row, shap_matrix[idx], feature_cols, base_logodds
        )

        item = {
            "id": loc_id,
            "localidad": localidad.title(),
            "provincia": provincia,
            "region": region,
            "temporada": temporada,
            "lat": lat,
            "lon": lon,
            "risk_score": round(float(row["risk_score"]), 6),
            "risk_level": row["risk_level"],
            "target_hist": safe_int(row.get("target")),
            "max_capturas": safe_float(row.get("max_capturas")),
            "mean_capturas": safe_float(row.get("mean_capturas")),
            "n_lecturas": safe_int(row.get("n_lecturas")),
            "n_detecciones": safe_int(row.get("n_detecciones")),
            "top_features": build_top_features(row),
            "shap_features": shap_feats,
            "shap_base_value": base_prob,
        }
        items.append(item)

    generated_at = iso_utc_now()
    seasons_available = sorted({x["temporada"] for x in items if x.get("temporada")})
    regions_available = sorted({x["region"] for x in items if x.get("region")})
    records_valid = len(items)
    records_discarded = records_total - records_valid

    scores_payload = {"items": items}
    metadata_payload = {
        "generated_at": generated_at,
        "artifact_version": args.artifact_version,
        "records_total": records_total,
        "records_valid": records_valid,
        "records_discarded": records_discarded,
        "discard_reasons": discard_reasons,
        "seasons_available": seasons_available,
        "regions_available": regions_available,
    }

    args.scores_out.parent.mkdir(parents=True, exist_ok=True)
    args.metadata_out.parent.mkdir(parents=True, exist_ok=True)
    args.scores_out.write_text(json.dumps(scores_payload, ensure_ascii=False, indent=2), encoding="utf-8")
    args.metadata_out.write_text(json.dumps(metadata_payload, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"Scores written: {args.scores_out} ({records_valid} valid / {records_total} total)")
    print(f"Metadata written: {args.metadata_out}")
    print(f"Discard reasons: {discard_reasons}")


if __name__ == "__main__":
    main()
