import json
import time

import requests
import pandas as pd

from src.config import CACHE_DIR, GEOCODING_CACHE


NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "ChicharritAI/1.0"}


def _query_nominatim(query: str) -> dict | None:
    """Hace una query a Nominatim. Retorna {"lat": float, "lon": float} o None."""
    params = {"q": query, "format": "json", "limit": 1}
    resp = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=10)
    results = resp.json()
    if results:
        return {"lat": float(results[0]["lat"]), "lon": float(results[0]["lon"])}
    return None


def _geocode_single(localidad: str, provincia: str) -> dict | None:
    """Intenta geocodificar con fallbacks."""
    # Intento 1: localidad + provincia + Argentina
    result = _query_nominatim(f"{localidad}, {provincia}, Argentina")
    if result:
        return result

    # Intento 2: solo localidad + Argentina
    result = _query_nominatim(f"{localidad}, Argentina")
    if result:
        return result

    return None


def geocode_all(trap_df: pd.DataFrame) -> dict:
    """
    Geocodifica todas las localidades únicas del DataFrame de trampas.
    Usa cache persistente para no repetir requests.
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Cargar cache
    cache = {}
    if GEOCODING_CACHE.exists():
        with open(GEOCODING_CACHE) as f:
            cache = json.load(f)

    # Localidades únicas
    unique = trap_df[["localidad", "provincia"]].drop_duplicates()
    print(f"Localidades únicas: {len(unique)}")

    new_queries = 0
    for _, row in unique.iterrows():
        key = f"{row['localidad']}__{row['provincia']}"
        if key in cache:
            continue

        coords = _geocode_single(row["localidad"], row["provincia"])
        cache[key] = coords
        new_queries += 1

        status = f"({coords['lat']:.2f}, {coords['lon']:.2f})" if coords else "NO ENCONTRADA"
        print(f"  {row['localidad']}, {row['provincia']}: {status}")

        time.sleep(1.1)

    # Guardar cache
    with open(GEOCODING_CACHE, "w") as f:
        json.dump(cache, f, indent=2, ensure_ascii=False)

    found = sum(1 for v in cache.values() if v is not None)
    print(f"\nGeocodificadas: {found}/{len(cache)} ({new_queries} queries nuevas)")
    return cache
