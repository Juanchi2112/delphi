from math import radians, sin, cos, sqrt, atan2

from src.config import ENDEMIC_LAT, ENDEMIC_LON


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distancia en km entre dos puntos geográficos."""
    R = 6371
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return R * 2 * atan2(sqrt(a), sqrt(1 - a))


def compute_geographic_features(lat: float, lon: float) -> dict:
    """Calcula 3 features geográficas."""
    return {
        "lat": lat,
        "lon": lon,
        "dist_zona_endemica_km": _haversine(lat, lon, ENDEMIC_LAT, ENDEMIC_LON),
    }


def compute_nearest_outbreak(lat: float, lon: float, prev_outbreaks: list) -> dict:
    """
    Calcula features de proximidad a outbreaks de la temporada anterior.

    Args:
        prev_outbreaks: lista de dicts con {lat, lon, max_capturas}
    """
    NO_DATA_DIST = 9999.0  # Sin datos de temporada anterior
    if not prev_outbreaks:
        return {
            "dist_nearest_outbreak_km": NO_DATA_DIST,
            "dist_nearest_high_outbreak_km": NO_DATA_DIST,
            "n_outbreaks_within_100km": 0,
            "n_outbreaks_within_200km": 0,
        }

    distances = [_haversine(lat, lon, o["lat"], o["lon"]) for o in prev_outbreaks]
    high_outbreaks = [i for i, o in enumerate(prev_outbreaks) if o["max_capturas"] >= 100]
    high_distances = [distances[i] for i in high_outbreaks] if high_outbreaks else [9999.0]

    return {
        "dist_nearest_outbreak_km": float(min(distances)),
        "dist_nearest_high_outbreak_km": float(min(high_distances)),
        "n_outbreaks_within_100km": int(sum(1 for d in distances if d <= 100)),
        "n_outbreaks_within_200km": int(sum(1 for d in distances if d <= 200)),
    }
