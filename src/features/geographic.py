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
