from typing import Optional

import requests
import pandas as pd


ONI_URL = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"


def get_oni_data() -> pd.DataFrame:
    """Descarga el índice ONI (Oceanic Niño Index) de NOAA."""
    resp = requests.get(ONI_URL, timeout=10)
    resp.raise_for_status()

    # Format: SEAS  YR   TOTAL   ANOM
    records = []
    for line in resp.text.strip().split("\n")[1:]:
        parts = line.split()
        if len(parts) >= 4:
            records.append({
                "season": parts[0],
                "year": int(parts[1]),
                "oni": float(parts[3]),  # ANOM column
            })
    return pd.DataFrame(records)


def get_oni_for_winter(year: int) -> Optional[float]:
    """Retorna el ONI promedio del invierno argentino (JJA) para un año dado."""
    oni_df = get_oni_data()
    jja = oni_df[(oni_df["year"] == year) & (oni_df["season"] == "JJA")]
    if len(jja) > 0:
        return float(jja.iloc[0]["oni"])
    return None
