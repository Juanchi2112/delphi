import json

import pandas as pd

from src.config import GEOCODING_CACHE, OUTPUT_DIR, SEASONS
from src.weather.historical import fetch_weather
from src.weather.enso import get_oni_for_winter
from src.features.climate import compute_winter_features, compute_spring_features
from src.features.geographic import compute_geographic_features


def build_dataset(trap_df: pd.DataFrame) -> pd.DataFrame:
    """
    Ensambla el dataset final: para cada localidad, combina
    target (capturas) + features climáticas + geográficas + ENSO.
    """
    # Cargar cache de geocoding
    with open(GEOCODING_CACHE) as f:
        coords_cache = json.load(f)

    # ONI por temporada
    oni_cache = {}
    for season_name, season_cfg in SEASONS.items():
        year = int(season_name.split("-")[0])
        oni_val = get_oni_for_winter(year)
        oni_cache[season_name] = oni_val
        print(f"ONI invierno {year} (JJA): {oni_val}")

    rows = []
    skipped = 0

    for _, row in trap_df.iterrows():
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

        # Features climáticas: invierno
        try:
            winter_weather = fetch_weather(lat, lon, season["winter_start"], season["winter_end"])
            winter_feats = compute_winter_features(winter_weather)
        except Exception as e:
            print(f"  Error clima invierno {row['localidad']} ({temporada}): {e}")
            skipped += 1
            continue

        # Features climáticas: primavera
        try:
            spring_weather = fetch_weather(lat, lon, season["spring_start"], season["spring_end"])
            spring_feats = compute_spring_features(spring_weather)
        except Exception as e:
            print(f"  Error clima primavera {row['localidad']} ({temporada}): {e}")
            skipped += 1
            continue

        # Features geográficas
        geo_feats = compute_geographic_features(lat, lon)

        # Ensamblar fila
        assembled = {
            "localidad": row["localidad"],
            "provincia": row["provincia"],
            "region": row["region"],
            "temporada": temporada,
            **geo_feats,
            "oni_invierno": oni_cache[temporada],
            **winter_feats,
            **spring_feats,
            "max_capturas": row["max_capturas"],
            "mean_capturas": row["mean_capturas"],
            "n_lecturas": row["n_lecturas"],
            "n_detecciones": row["n_detecciones"],
            "target": row["target"],
        }
        rows.append(assembled)

    result = pd.DataFrame(rows)

    # Guardar
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / "dataset.csv"
    result.to_csv(out_path, index=False)
    print(f"\nDataset guardado: {out_path}")
    print(f"  Filas: {len(result)} (skipped {skipped} sin coords o clima)")
    print(f"  Features: {len([c for c in result.columns if c not in ['localidad', 'provincia', 'region', 'temporada', 'max_capturas', 'mean_capturas', 'n_lecturas', 'n_detecciones', 'target']])}")
    print(f"  Target=1: {result['target'].sum()} ({result['target'].mean():.1%})")

    return result
