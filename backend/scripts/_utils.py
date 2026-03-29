"""Shared utilities for precompute scripts."""
from __future__ import annotations

import math
import re
from datetime import datetime, timezone

import numpy as np
import pandas as pd
import shap
import xgboost as xgb

# Rough bbox for Argentina mainland demo filtering.
ARG_BBOX = {
    "min_lat": -56.0,
    "max_lat": -21.0,
    "min_lon": -76.0,
    "max_lon": -53.0,
}


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


def sigmoid(x: float) -> float:
    if x >= 0:
        return 1.0 / (1.0 + math.exp(-x))
    ex = math.exp(x)
    return ex / (1.0 + ex)


def load_model_scores(model_path, df: pd.DataFrame, feature_cols: list[str]) -> list[float]:
    booster = xgb.Booster()
    booster.load_model(str(model_path))
    dmatrix = xgb.DMatrix(df[feature_cols], feature_names=feature_cols)
    preds = booster.predict(dmatrix)
    return [float(x) for x in preds]


def compute_shap_values(
    model_path, df: pd.DataFrame, feature_cols: list[str]
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
    """Build top-k SHAP features with contributions in probability space."""
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


def build_top_features(row: pd.Series, priority: list[str], n: int = 3) -> list[dict[str, float | None]]:
    result: list[dict[str, float | None]] = []
    for feat in priority:
        if feat in row.index:
            result.append({"name": feat, "value": safe_float(row.get(feat))})
        if len(result) == n:
            break
    return result
