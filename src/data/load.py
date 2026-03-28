import re
from datetime import datetime

import pandas as pd

from src.config import CSVS_DIR, N_REPORTS, NON_READING_COLS


def _parse_date_range(col_name: str) -> tuple[datetime, datetime]:
    """
    Parsea fechas de nombres de columna como:
      'Lectura_15_07_24_al_01_08_24'
      'N_adultos_D_maidis_trampa_15_07_24_al_02_08_24'
      'Cant_04_09_24_al_18_09_24'
    Retorna (fecha_inicio, fecha_fin).
    """
    match = re.search(r"(\d{2}_\d{2}_\d{2})_al_(\d{2}_\d{2}_\d{2})", col_name)
    if not match:
        raise ValueError(f"No se pudo parsear fecha de columna: {col_name}")
    start = datetime.strptime(match.group(1), "%d_%m_%y")
    end = datetime.strptime(match.group(2), "%d_%m_%y")
    return start, end


def _load_single_report(report_num: int) -> pd.DataFrame:
    """Carga un CSV y lo convierte a formato long."""
    path = CSVS_DIR / f"{report_num}.csv"
    df = pd.read_csv(path, dtype=str, on_bad_lines="warn")

    # Normalizar nombres de columnas a lowercase para identificarlas
    col_map = {c: c.strip() for c in df.columns}
    df.rename(columns=col_map, inplace=True)
    cols_lower = {c: c.lower() for c in df.columns}

    # Identificar columnas fijas vs columnas de lectura
    fixed_cols = []
    reading_cols = []
    for orig_col in df.columns:
        if cols_lower[orig_col] in NON_READING_COLS:
            fixed_cols.append(orig_col)
        else:
            reading_cols.append(orig_col)

    if not reading_cols:
        raise ValueError(f"No se encontraron columnas de lectura en informe {report_num}")

    # Normalizar columnas fijas
    rename_fixed = {}
    for c in fixed_cols:
        low = c.lower()
        if low in ("zona", "región", "region"):
            rename_fixed[c] = "region"
        elif low in ("provincia", "provincia/pais"):
            rename_fixed[c] = "provincia"
        elif low == "localidad":
            rename_fixed[c] = "localidad"
        # Ignorar latitud/longitud (no son confiables)

    df.rename(columns=rename_fixed, inplace=True)

    # Melt: wide → long
    id_cols = [c for c in ["region", "provincia", "localidad"] if c in df.columns]
    rows = []
    for col in reading_cols:
        low = col.lower()
        # Saltar latitud/longitud si quedaron como reading cols
        if low in ("latitud", "longitud"):
            continue
        try:
            fecha_inicio, fecha_fin = _parse_date_range(col)
        except ValueError:
            continue

        subset = df[id_cols + [col]].copy()
        subset = subset.rename(columns={col: "capturas_raw"})
        subset["informe"] = report_num
        subset["fecha_inicio"] = fecha_inicio
        subset["fecha_fin"] = fecha_fin
        rows.append(subset)

    return pd.concat(rows, ignore_index=True)


def load_all_reports() -> pd.DataFrame:
    """Carga y concatena los 21 CSVs en formato long."""
    dfs = []
    for i in range(1, N_REPORTS + 1):
        df = _load_single_report(i)
        dfs.append(df)
        print(f"  Informe {i:2d}: {len(df)} lecturas")

    result = pd.concat(dfs, ignore_index=True)
    print(f"\nTotal: {len(result)} lecturas crudas")
    return result
