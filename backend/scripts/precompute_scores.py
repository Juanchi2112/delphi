#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
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

FEATURE_PRIORITY = [
    "dist_zona_endemica_km",
    "temp_media_invierno",
    "gdd_base10_primavera",
    "precip_total_primavera",
    "wind_norte_ratio",
    "oni_invierno",
]


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
            "top_features": build_top_features(row, FEATURE_PRIORITY),
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
