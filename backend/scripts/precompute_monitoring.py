#!/usr/bin/env python3
"""Generate precomputed monitoring scores from the 14-day model."""
from __future__ import annotations

import argparse
import json
from collections import defaultdict
from datetime import datetime
from pathlib import Path

import pandas as pd

from backend.app.services.scoring import to_risk_level
from backend.scripts._utils import (
    iso_utc_now,
    norm_str,
    sanitize_for_id,
    is_valid_localidad,
    in_argentina_bbox,
    safe_float,
    safe_int,
    build_top_features,
    compute_shap_values,
    build_shap_features,
    load_model_scores,
)

META_COLS_14D = [
    "localidad",
    "provincia",
    "region",
    "temporada",
    "fecha_inicio",
    "fecha_fin",
    "fecha_mid",
    "next_fecha_inicio",
    "next_fecha_fin",
    "target",
    "next_capturas",
    "day_of_year",
]

FEATURE_PRIORITY_14D = [
    "capturas_actual",
    "propagation_pressure",
    "capturas_trend",
    "temp_mean_period",
    "gdd_base10_period",
    "dist_zona_endemica_km",
]

CAPTURE_THRESHOLD = 5
HIGH_RISK_THRESHOLD = 0.65
NEIGHBOR_PRESSURE_THRESHOLD = 0.5
TREND_DELTA_THRESHOLD = 0.05


def classify_alert(
    capturas_actual: float | None,
    risk_score: float,
    neighbor_pressure: float | None,
) -> str:
    is_outbreak = (capturas_actual or 0) >= CAPTURE_THRESHOLD
    is_high_risk = risk_score >= HIGH_RISK_THRESHOLD
    has_neighbor_pressure = (neighbor_pressure or 0) > NEIGHBOR_PRESSURE_THRESHOLD

    if is_outbreak and is_high_risk:
        return "brote_riesgo_alto"
    if not is_outbreak and has_neighbor_pressure:
        return "alerta_vecinos"
    if is_outbreak:
        return "brote_activo"
    return "bajo_riesgo"


def classify_trend(
    current_score: float, prev_score: float | None
) -> tuple[str, float]:
    if prev_score is None:
        return "stable", 0.0
    delta = current_score - prev_score
    if delta > TREND_DELTA_THRESHOLD:
        return "rising", round(delta, 4)
    if delta < -TREND_DELTA_THRESHOLD:
        return "falling", round(delta, 4)
    return "stable", round(delta, 4)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate precomputed monitoring scores from 14d model."
    )
    parser.add_argument("--dataset", type=Path, default=Path("output/dataset_14d.csv"))
    parser.add_argument("--model", type=Path, default=Path("output/model_14d.json"))
    parser.add_argument("--scores-out", type=Path, default=Path("output/monitoring_map.json"))
    parser.add_argument("--metadata-out", type=Path, default=Path("output/monitoring_metadata.json"))
    parser.add_argument(
        "--artifact-version", type=str, default=datetime.now().strftime("%Y-%m-%d")
    )
    args = parser.parse_args()

    # ── Load data & model ─────────────────────────────────────────────
    df = pd.read_csv(args.dataset)
    feature_cols = [c for c in df.columns if c not in META_COLS_14D]
    print(f"Dataset: {len(df)} rows, {len(feature_cols)} features")

    risk_scores = load_model_scores(args.model, df, feature_cols)
    shap_matrix, base_logodds = compute_shap_values(args.model, df, feature_cols)

    df = df.copy()
    df["risk_score"] = risk_scores
    df["risk_level"] = df["risk_score"].apply(to_risk_level)

    # ── Sort by temporada + fecha_mid for chronological ordering ──────
    df["_fecha_mid_dt"] = pd.to_datetime(df["fecha_mid"], errors="coerce")
    df = df.sort_values(["temporada", "localidad", "provincia", "_fecha_mid_dt"]).reset_index(
        drop=True
    )

    # ── Assign quincena_index per (localidad, provincia, temporada) ───
    df["_loc_key_raw"] = df["localidad"].apply(norm_str) + "|" + df["provincia"].apply(norm_str)
    df["quincena_index"] = df.groupby(["_loc_key_raw", "temporada"]).cumcount() + 1

    # ── Build items with validation ───────────────────────────────────
    records_total = len(df)
    discard_reasons = {"invalid_bbox": 0, "invalid_localidad": 0, "missing_coordinates": 0}
    items: list[dict] = []

    # Track previous risk_score per locality for trend calculation
    prev_scores: dict[str, float] = {}

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

        localidad_key = f"{sanitize_for_id(localidad)}-{sanitize_for_id(provincia)}"
        quincena_idx = int(row["quincena_index"])
        item_id = f"{localidad_key}-{sanitize_for_id(temporada)}-q{quincena_idx:02d}"

        risk_score = round(float(row["risk_score"]), 6)
        capturas_actual = safe_float(row.get("capturas_actual"))
        neighbor_pressure = safe_float(row.get("propagation_pressure"))
        is_currently_outbreak = bool((capturas_actual or 0) >= CAPTURE_THRESHOLD)

        # Trend
        loc_trend_key = f"{localidad_key}|{temporada}"
        prev_score = prev_scores.get(loc_trend_key)
        trend, trend_delta = classify_trend(risk_score, prev_score)
        prev_scores[loc_trend_key] = risk_score

        # Alert category
        alert_category = classify_alert(capturas_actual, risk_score, neighbor_pressure)

        # SHAP
        shap_feats, base_prob = build_shap_features(
            row, shap_matrix[idx], feature_cols, base_logodds
        )

        item = {
            "id": item_id,
            "localidad_key": localidad_key,
            "localidad": localidad.title(),
            "provincia": provincia,
            "region": region,
            "temporada": temporada,
            "lat": lat,
            "lon": lon,
            "fecha_inicio": norm_str(row.get("fecha_inicio")),
            "fecha_fin": norm_str(row.get("fecha_fin")),
            "quincena_index": quincena_idx,
            "risk_score": risk_score,
            "risk_level": row["risk_level"],
            "alert_category": alert_category,
            "capturas_actual": capturas_actual,
            "is_currently_outbreak": is_currently_outbreak,
            "trend": trend,
            "trend_delta": trend_delta,
            "neighbor_pressure": round(neighbor_pressure, 4) if neighbor_pressure is not None else None,
            "top_features": build_top_features(row, FEATURE_PRIORITY_14D),
            "shap_features": shap_feats,
            "shap_base_value": base_prob,
        }
        items.append(item)

    # ── Build timelines ───────────────────────────────────────────────
    grouped: dict[str, list[dict]] = defaultdict(list)
    for item in items:
        grouped[item["localidad_key"]].append(item)

    timelines: dict[str, dict] = {}
    for loc_key, loc_items in grouped.items():
        loc_items.sort(key=lambda x: x["quincena_index"])
        latest = loc_items[-1]

        readings = []
        for it in loc_items:
            readings.append({
                "quincena_index": it["quincena_index"],
                "fecha_inicio": it["fecha_inicio"],
                "fecha_fin": it["fecha_fin"],
                "risk_score": it["risk_score"],
                "risk_level": it["risk_level"],
                "alert_category": it["alert_category"],
                "capturas_actual": it["capturas_actual"],
                "trend": it["trend"],
                "trend_delta": it["trend_delta"],
            })

        timelines[loc_key] = {
            "localidad": latest["localidad"],
            "provincia": latest["provincia"],
            "region": latest["region"],
            "lat": latest["lat"],
            "lon": latest["lon"],
            "temporada": latest["temporada"],
            "latest": latest,
            "readings": readings,
        }

    # ── Write outputs ─────────────────────────────────────────────────
    generated_at = iso_utc_now()
    seasons_available = sorted({x["temporada"] for x in items if x.get("temporada")})
    regions_available = sorted({x["region"] for x in items if x.get("region")})
    records_valid = len(items)

    # Collect date range
    all_dates = [it["fecha_inicio"] for it in items if it.get("fecha_inicio")]
    all_dates += [it["fecha_fin"] for it in items if it.get("fecha_fin")]
    all_dates = [d for d in all_dates if d]

    # Readings per locality stats
    readings_counts = [len(t["readings"]) for t in timelines.values()]
    avg_readings = sum(readings_counts) / len(readings_counts) if readings_counts else 0

    scores_payload = {"items": items, "timelines": timelines}
    metadata_payload = {
        "generated_at": generated_at,
        "artifact_version": args.artifact_version,
        "records_total": records_total,
        "records_valid": records_valid,
        "records_discarded": records_total - records_valid,
        "discard_reasons": discard_reasons,
        "localities_count": len(timelines),
        "readings_per_locality_avg": round(avg_readings, 1),
        "seasons_available": seasons_available,
        "regions_available": regions_available,
        "date_range_start": min(all_dates) if all_dates else None,
        "date_range_end": max(all_dates) if all_dates else None,
    }

    args.scores_out.parent.mkdir(parents=True, exist_ok=True)
    args.metadata_out.parent.mkdir(parents=True, exist_ok=True)
    args.scores_out.write_text(
        json.dumps(scores_payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    args.metadata_out.write_text(
        json.dumps(metadata_payload, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"Monitoring scores written: {args.scores_out} ({records_valid} valid / {records_total} total)")
    print(f"Monitoring metadata written: {args.metadata_out}")
    print(f"Localities: {len(timelines)}, Avg readings/locality: {avg_readings:.1f}")
    print(f"Discard reasons: {discard_reasons}")


if __name__ == "__main__":
    main()
