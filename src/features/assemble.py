import json

import pandas as pd

from src.config import GEOCODING_CACHE, OUTPUT_DIR, SEASONS, PREV_SEASON_MAP
from src.weather.historical import fetch_weather
from src.weather.enso import get_oni_for_winter
from src.features.climate import compute_winter_features, compute_spring_features
from src.features.geographic import compute_geographic_features, compute_nearest_outbreak


def _build_prev_outbreaks(trap_df: pd.DataFrame, coords_cache: dict) -> dict:
    """Construye lookup de outbreaks de la temporada anterior con coordenadas."""
    prev_outbreaks = {}
    for season_name, prev_name in PREV_SEASON_MAP.items():
        prev_data = trap_df[(trap_df["temporada"] == prev_name) & (trap_df["target"] == 1)]
        outbreaks = []
        for _, row in prev_data.iterrows():
            key = f"{row['localidad']}__{row['provincia']}"
            coords = coords_cache.get(key)
            if coords:
                outbreaks.append({
                    "lat": coords["lat"],
                    "lon": coords["lon"],
                    "max_capturas": row["max_capturas"],
                })
        prev_outbreaks[season_name] = outbreaks
    return prev_outbreaks


def _build_prev_captures(trap_df: pd.DataFrame) -> dict:
    """Construye lookup de capturas de la temporada anterior por localidad."""
    prev_captures = {}
    for season_name, prev_name in PREV_SEASON_MAP.items():
        prev_data = trap_df[trap_df["temporada"] == prev_name].copy()
        prev_data["_key"] = prev_data["localidad"] + "__" + prev_data["provincia"].fillna("")
        agg = prev_data.groupby("_key").agg(
            max_capturas=("max_capturas", "max"),
            mean_capturas=("mean_capturas", "mean"),
            target=("target", "max"),
            n_detecciones=("n_detecciones", "sum"),
        )
        prev_captures[season_name] = agg.to_dict("index")
    return prev_captures


def build_dataset(trap_df: pd.DataFrame) -> pd.DataFrame:
    """
    Ensambla el dataset final: features climáticas + geográficas + ENSO
    + distancia a outbreaks previos + historial de la localidad.
    """
    with open(GEOCODING_CACHE) as f:
        coords_cache = json.load(f)

    # ONI por temporada
    oni_cache = {}
    for season_name in SEASONS:
        year = int(season_name.split("-")[0])
        oni_cache[season_name] = get_oni_for_winter(year)
        print(f"ONI invierno {year} (JJA): {oni_cache[season_name]}")

    # Datos de temporadas anteriores (features 3 y 4)
    prev_outbreaks = _build_prev_outbreaks(trap_df, coords_cache)
    prev_captures = _build_prev_captures(trap_df)

    rows = []
    skipped = 0
    total = len(trap_df)

    for i, (_, row) in enumerate(trap_df.iterrows()):
        if (i + 1) % 50 == 0 or i == 0:
            print(f"  Procesando {i + 1}/{total} ...", flush=True)
        key = f"{row['localidad']}__{row['provincia']}"
        coords = coords_cache.get(key)
        if coords is None:
            skipped += 1
            continue

        lat, lon = coords["lat"], coords["lon"]
        temporada = row["temporada"]
        season = SEASONS.get(temporada)
        if season is None:
            skipped += 1
            continue

        # --- Clima: invierno ---
        try:
            winter_weather = fetch_weather(lat, lon, season["winter_start"], season["winter_end"])
            winter_feats = compute_winter_features(winter_weather)
        except Exception as e:
            print(f"  Error clima invierno {row['localidad']} ({temporada}): {e}")
            skipped += 1
            continue

        # --- Clima: primavera ---
        try:
            spring_weather = fetch_weather(lat, lon, season["spring_start"], season["spring_end"])
            spring_feats = compute_spring_features(spring_weather)
        except Exception as e:
            print(f"  Error clima primavera {row['localidad']} ({temporada}): {e}")
            skipped += 1
            continue

        # --- Geográficas ---
        geo_feats = compute_geographic_features(lat, lon)

        # --- Distancia a outbreaks previos ---
        outbreak_list = prev_outbreaks.get(temporada, [])
        outbreak_feats = compute_nearest_outbreak(lat, lon, outbreak_list)

        # --- Historial de la localidad ---
        prev_key = f"{row['localidad']}__{row['provincia']}"
        prev_caps = prev_captures.get(temporada, {}).get(prev_key, None)
        if prev_caps:
            history_feats = {
                "prev_max_capturas": prev_caps["max_capturas"],
                "prev_mean_capturas": prev_caps["mean_capturas"],
                "prev_target": prev_caps["target"],
                "prev_n_detecciones": prev_caps["n_detecciones"],
            }
        else:
            history_feats = {
                "prev_max_capturas": 0.0,
                "prev_mean_capturas": 0.0,
                "prev_target": 0,
                "prev_n_detecciones": 0,
            }

        # --- Ensamblar ---
        assembled = {
            "localidad": row["localidad"],
            "provincia": row["provincia"],
            "region": row["region"],
            "temporada": temporada,
            **geo_feats,
            "oni_invierno": oni_cache[temporada],
            **winter_feats,
            **spring_feats,
            **outbreak_feats,
            **history_feats,
            "max_capturas": row["max_capturas"],
            "mean_capturas": row["mean_capturas"],
            "n_lecturas": row["n_lecturas"],
            "n_detecciones": row["n_detecciones"],
            "target": row["target"],
        }
        rows.append(assembled)

    result = pd.DataFrame(rows)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / "dataset.csv"
    result.to_csv(out_path, index=False)
    meta = {"localidad", "provincia", "region", "temporada",
            "max_capturas", "mean_capturas", "n_lecturas", "n_detecciones", "target"}
    n_feats = len([c for c in result.columns if c not in meta])
    print(f"\nDataset guardado: {out_path}")
    print(f"  Filas: {len(result)} (skipped {skipped})")
    print(f"  Features: {n_feats}")
    print(f"  Target=1: {result['target'].sum()} ({result['target'].mean():.1%})")

    return result
