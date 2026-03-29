import sys
import time

import requests
import pandas as pd

from src.config import DAILY_VARIABLES, WEATHER_COL_MAP, WEATHER_CACHE_DIR


OPEN_METEO_URL = "https://archive-api.open-meteo.com/v1/archive"
MAX_RETRIES = 8
BASE_DELAY = 5  # seconds
REQUEST_GAP = 0.6  # seconds between any two API calls

_last_request_time = 0.0
_api_call_count = 0


def fetch_weather(lat: float, lon: float, start_date: str, end_date: str) -> pd.DataFrame:
    """
    Obtiene datos climáticos diarios de Open-Meteo Historical API.
    Usa cache en parquet para no repetir requests.
    Incluye throttle proactivo y retry con backoff exponencial para rate limits (429).
    """
    global _last_request_time

    WEATHER_CACHE_DIR.mkdir(parents=True, exist_ok=True)

    cache_file = WEATHER_CACHE_DIR / f"{lat:.4f}_{lon:.4f}_{start_date}_{end_date}.parquet"
    if cache_file.exists():
        return pd.read_parquet(cache_file)

    global _api_call_count
    _api_call_count += 1
    print(f"    [API #{_api_call_count}] Fetching ({lat:.4f}, {lon:.4f}) {start_date}..{end_date}", flush=True)

    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": ",".join(DAILY_VARIABLES),
        "timezone": "America/Argentina/Buenos_Aires",
    }

    for attempt in range(MAX_RETRIES):
        # Proactive throttle: wait between requests
        elapsed = time.time() - _last_request_time
        if elapsed < REQUEST_GAP:
            time.sleep(REQUEST_GAP - elapsed)

        _last_request_time = time.time()
        resp = requests.get(OPEN_METEO_URL, params=params, timeout=30)
        if resp.status_code == 429:
            delay = BASE_DELAY * (2 ** attempt)
            print(f"    Rate limited, waiting {delay}s (attempt {attempt + 1}/{MAX_RETRIES})...", flush=True)
            time.sleep(delay)
            _last_request_time = time.time()
            continue
        resp.raise_for_status()
        break
    else:
        resp.raise_for_status()  # Will raise the last 429

    data = resp.json()

    if "daily" not in data:
        raise ValueError(f"Open-Meteo no retornó datos para ({lat}, {lon}): {data}")

    daily = data["daily"]
    df = pd.DataFrame({"date": pd.to_datetime(daily["time"])})
    for api_name, short_name in WEATHER_COL_MAP.items():
        df[short_name] = daily.get(api_name)

    df.to_parquet(cache_file, index=False)
    return df
