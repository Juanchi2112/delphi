import requests
import pandas as pd

from src.config import DAILY_VARIABLES, WEATHER_COL_MAP, WEATHER_CACHE_DIR


OPEN_METEO_URL = "https://archive-api.open-meteo.com/v1/archive"


def fetch_weather(lat: float, lon: float, start_date: str, end_date: str) -> pd.DataFrame:
    """
    Obtiene datos climáticos diarios de Open-Meteo Historical API.
    Usa cache en parquet para no repetir requests.
    """
    WEATHER_CACHE_DIR.mkdir(parents=True, exist_ok=True)

    # Cache key
    cache_file = WEATHER_CACHE_DIR / f"{lat:.4f}_{lon:.4f}_{start_date}_{end_date}.parquet"
    if cache_file.exists():
        return pd.read_parquet(cache_file)

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": ",".join(DAILY_VARIABLES),
        "timezone": "America/Argentina/Buenos_Aires",
    }

    resp = requests.get(OPEN_METEO_URL, params=params, timeout=30)
    resp.raise_for_status()
    data = resp.json()

    if "daily" not in data:
        raise ValueError(f"Open-Meteo no retornó datos para ({lat}, {lon}): {data}")

    daily = data["daily"]
    df = pd.DataFrame({"date": pd.to_datetime(daily["time"])})
    for api_name, short_name in WEATHER_COL_MAP.items():
        df[short_name] = daily.get(api_name)

    df.to_parquet(cache_file, index=False)
    return df
