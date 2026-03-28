import re

import pandas as pd

from src.config import CAPTURE_THRESHOLD, LOCALIDAD_REPLACEMENTS, OUTPUT_DIR, REPORT_SEASON_MAP


def _normalize_localidad(name: str) -> str:
    """Normaliza nombre de localidad: lowercase, strip, abreviaturas, quitar sufijo de trampa."""
    s = name.strip().lower()

    # Expandir abreviaturas
    for abbr, full in LOCALIDAD_REPLACEMENTS.items():
        s = s.replace(abbr, full)

    # Quitar sufijos de trampa múltiple: "metan 1", "metan 2" → "metan"
    # También "las lajitas (este)", "las lajitas t3" → "las lajitas"
    s = re.sub(r"\s+\d+$", "", s)          # " 1", " 2"
    s = re.sub(r"\s*\(.*?\)\s*$", "", s)   # " (este)"
    s = re.sub(r"\s+t\d+$", "", s)         # " t3"

    # Limpiar espacios dobles
    s = re.sub(r"\s+", " ", s).strip()
    return s


def _parse_capturas(val: str) -> float:
    """Convierte valor crudo de capturas a numérico. Retorna NaN si no es válido."""
    if pd.isna(val):
        return float("nan")
    s = str(val).strip().lower()
    if s in ("", "sin datos", "trampa perdida"):
        return float("nan")
    try:
        return float(s)
    except ValueError:
        return float("nan")


def clean_trap_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Limpia el DataFrame crudo de load_all_reports().
    Retorna DataFrame agregado por localidad con target.
    """
    df = df.copy()

    # Dropear filas sin localidad
    df = df.dropna(subset=["localidad"])
    df = df[df["localidad"].str.strip() != ""]

    # Normalizar localidades
    df["localidad"] = df["localidad"].apply(_normalize_localidad)
    df["provincia"] = df["provincia"].fillna("").str.strip().str.title()
    df["region"] = df["region"].fillna("").str.strip().str.upper()

    # Convertir capturas
    df["capturas"] = df["capturas_raw"].apply(_parse_capturas)

    # Asignar temporada por número de informe
    df["temporada"] = df["informe"].map(REPORT_SEASON_MAP)

    # Agregar por localidad: tomar máximo de capturas entre todas las trampas y lecturas
    agg = (
        df.groupby(["localidad", "provincia", "region", "temporada"])
        .agg(
            max_capturas=("capturas", "max"),
            mean_capturas=("capturas", "mean"),
            n_lecturas=("capturas", "count"),
            n_detecciones=("capturas", lambda x: (x > 0).sum()),
        )
        .reset_index()
    )

    # Target binario
    agg["target"] = (agg["max_capturas"] >= CAPTURE_THRESHOLD).astype(int)

    # Guardar
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path = OUTPUT_DIR / "trap_data_clean.csv"
    agg.to_csv(out_path, index=False)
    print(f"Guardado: {out_path} ({len(agg)} localidades)")
    print(f"  Target=1: {agg['target'].sum()} ({agg['target'].mean():.1%})")
    print(f"  Target=0: {(agg['target'] == 0).sum()} ({(agg['target'] == 0).mean():.1%})")

    return agg
