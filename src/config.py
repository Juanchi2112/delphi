from pathlib import Path

# Paths
PROJECT_ROOT = Path(__file__).resolve().parent.parent
CSVS_DIR = PROJECT_ROOT / "csvs"
CACHE_DIR = PROJECT_ROOT / "cache"
OUTPUT_DIR = PROJECT_ROOT / "output"
WEATHER_CACHE_DIR = CACHE_DIR / "weather"
GEOCODING_CACHE = CACHE_DIR / "geocoding.json"

# Número de informes disponibles
N_REPORTS = 38

# Target: umbral de capturas para clasificar como outbreak
CAPTURE_THRESHOLD = 5  # >=5 adultos/trampa = outbreak

# Zona endémica de referencia (Tucumán, sede INTA Famaillá)
ENDEMIC_LAT = -26.8
ENDEMIC_LON = -65.2

# Open-Meteo daily variables
DAILY_VARIABLES = [
    "temperature_2m_max",
    "temperature_2m_min",
    "temperature_2m_mean",
    "relative_humidity_2m_max",
    "relative_humidity_2m_min",
    "relative_humidity_2m_mean",
    "precipitation_sum",
    "wind_speed_10m_max",
    "wind_speed_10m_mean",
    "wind_direction_10m_dominant",
]

# Mapping de nombres cortos para las variables de Open-Meteo
WEATHER_COL_MAP = {
    "temperature_2m_max": "temp_max",
    "temperature_2m_min": "temp_min",
    "temperature_2m_mean": "temp_mean",
    "relative_humidity_2m_max": "rh_max",
    "relative_humidity_2m_min": "rh_min",
    "relative_humidity_2m_mean": "rh_mean",
    "precipitation_sum": "precip",
    "wind_speed_10m_max": "wind_max",
    "wind_speed_10m_mean": "wind_mean",
    "wind_direction_10m_dominant": "wind_dir",
}

# Períodos para features climáticas por temporada
SEASONS = {
    "2024-2025": {
        "winter_start": "2024-06-01",
        "winter_end": "2024-08-31",
        "spring_start": "2024-09-01",
        "spring_end": "2024-10-31",
    },
    "2025-2026": {
        "winter_start": "2025-06-01",
        "winter_end": "2025-08-31",
        "spring_start": "2025-09-01",
        "spring_end": "2025-10-31",
    },
}

# Mapping temporada → temporada anterior (para features de historial)
PREV_SEASON_MAP = {"2025-2026": "2024-2025"}

# Mapping informe → temporada
REPORT_SEASON_MAP = {i: "2024-2025" for i in range(1, 22)}
REPORT_SEASON_MAP.update({i: "2025-2026" for i in range(22, 39)})

# Columnas conocidas que NO son lecturas de capturas
NON_READING_COLS = {"zona", "región", "region", "provincia", "provincia/pais",
                    "localidad", "latitud", "longitud"}

# Normalización de nombres de localidades
LOCALIDAD_REPLACEMENTS = {
    "gral.": "general",
    "gral ": "general ",
    "nstra": "nuestra",
    "ntra.": "nuestra",
    "sra ": "señora ",
    "sra.": "señora",
    "cnel ": "coronel ",
    "cnel.": "coronel",
}
