import json
import time
from typing import Dict, Optional, Tuple

import requests
import pandas as pd

from src.config import CACHE_DIR, GEOCODING_CACHE


NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
HEADERS = {"User-Agent": "Delphi/1.0"}

# Bounding boxes aproximados (lat_min, lat_max, lon_min, lon_max)
PROVINCE_BOUNDS: Dict[str, Tuple[float, float, float, float]] = {
    "Buenos Aires":        (-41.0, -33.2, -63.5, -56.5),
    "Bs As":               (-41.0, -33.2, -63.5, -56.5),
    "Córdoba":             (-35.5, -29.3, -66.0, -61.5),
    "Santa Fe":            (-34.5, -28.0, -62.8, -59.0),
    "Entre Ríos":          (-34.0, -30.0, -61.0, -57.5),
    "Corrientes":          (-30.7, -27.2, -59.7, -55.5),
    "Chaco":               (-28.5, -24.0, -63.5, -58.5),
    "Santiago Del Estero":  (-30.5, -25.5, -66.0, -61.0),
    "Tucumán":             (-28.0, -26.0, -66.5, -64.5),
    "Salta":               (-26.5, -22.0, -68.5, -62.5),
    "Jujuy":               (-24.5, -21.7, -67.5, -64.0),
    "Formosa":             (-26.5, -23.0, -62.5, -57.5),
    "La Pampa":            (-39.0, -34.5, -68.5, -63.0),
    "San Luis":            (-36.0, -31.8, -67.5, -64.5),
    "San Luís":            (-36.0, -31.8, -67.5, -64.5),
    "Catamarca":           (-30.5, -25.5, -69.5, -64.5),
    "Misiones":            (-28.2, -25.5, -56.0, -53.5),
    "Uruguay":             (-35.5, -30.0, -59.0, -53.0),
}

# Argentina en general
ARGENTINA_BOUNDS = (-56.0, -21.5, -73.5, -53.0)


def _is_in_bounds(lat: float, lon: float, bounds: Tuple[float, float, float, float]) -> bool:
    lat_min, lat_max, lon_min, lon_max = bounds
    return lat_min <= lat <= lat_max and lon_min <= lon <= lon_max


def _query_nominatim(query: str) -> Optional[dict]:
    """Hace una query a Nominatim. Retorna {"lat": float, "lon": float} o None."""
    params = {"q": query, "format": "json", "limit": 1}
    resp = requests.get(NOMINATIM_URL, params=params, headers=HEADERS, timeout=10)
    results = resp.json()
    if results:
        return {"lat": float(results[0]["lat"]), "lon": float(results[0]["lon"])}
    return None


def _validate_result(result: dict, provincia: str) -> bool:
    """Valida que las coordenadas caigan dentro de la provincia esperada."""
    if result is None:
        return False
    lat, lon = result["lat"], result["lon"]
    if provincia in PROVINCE_BOUNDS:
        return _is_in_bounds(lat, lon, PROVINCE_BOUNDS[provincia])
    # Si no tenemos bbox para la provincia, al menos verificar que esté en Sudamérica
    return -56 < lat < -15 and -75 < lon < -45


def _geocode_single(localidad: str, provincia: str) -> Optional[dict]:
    """Intenta geocodificar con fallbacks y validación de provincia."""
    country = "Uruguay" if provincia == "Uruguay" else "Argentina"

    queries = [
        f"{localidad}, {provincia}, {country}",
        f"{localidad}, {country}",
    ]
    if country == "Argentina":
        queries.insert(1, f"localidad {localidad}, {provincia}, Argentina")

    for query in queries:
        result = _query_nominatim(query)
        if result and _validate_result(result, provincia):
            return result
        time.sleep(1.1)

    # Si ningún intento pasó la validación, retornar None en lugar de coords incorrectas
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
