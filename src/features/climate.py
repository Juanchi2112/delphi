import pandas as pd


def compute_winter_features(weather_df: pd.DataFrame) -> dict:
    """
    Calcula 16 features del invierno (jun-ago) a partir de datos diarios de Open-Meteo.
    """
    w = weather_df.copy()

    return {
        # Heladas
        "heladas_count": int((w["temp_min"] < 0).sum()),
        "heladas_severas_count": int((w["temp_min"] < -6).sum()),
        "temp_min_abs": float(w["temp_min"].min()),
        # Temperatura general
        "temp_media_invierno": float(w["temp_mean"].mean()),
        "temp_min_media_invierno": float(w["temp_min"].mean()),
        # Días cálidos (chicharrita activa)
        "dias_tmin_gt_10": int((w["temp_min"] > 10).sum()),
        "dias_tmin_gt_15": int((w["temp_min"] > 15).sum()),
        "dias_tmin_gt_18": int((w["temp_min"] > 18).sum()),
        # Grados-día
        "gdd_base10": float(w["temp_mean"].apply(lambda x: max(0, x - 10)).sum()),
        "gdd_base0_negativo": float(w["temp_min"].apply(lambda x: min(0, x)).sum()),
        # Humedad
        "rh_mean_invierno": float(w["rh_mean"].mean()),
        "precip_total_invierno": float(w["precip"].sum()),
        "dias_con_lluvia": int((w["precip"] > 1).sum()),
        # Viento
        "wind_mean_invierno": float(w["wind_mean"].mean()),
        "wind_max_invierno": float(w["wind_max"].max()),
        # Ratio de viento del norte (migración desde zona endémica)
        "wind_norte_ratio": float(
            ((w["wind_dir"] >= 315) | (w["wind_dir"] <= 45)).sum() / len(w)
        ),
    }


def compute_spring_features(weather_df: pd.DataFrame) -> dict:
    """
    Calcula 8 features de primavera temprana (sep-oct) a partir de datos diarios.
    """
    s = weather_df.copy()

    return {
        "temp_media_primavera": float(s["temp_mean"].mean()),
        "temp_min_media_primavera": float(s["temp_min"].mean()),
        "dias_tmin_gt_15_primavera": int((s["temp_min"] > 15).sum()),
        "dias_tmin_gt_18_primavera": int((s["temp_min"] > 18).sum()),
        "gdd_base10_primavera": float(s["temp_mean"].apply(lambda x: max(0, x - 10)).sum()),
        "rh_mean_primavera": float(s["rh_mean"].mean()),
        "precip_total_primavera": float(s["precip"].sum()),
        "wind_mean_primavera": float(s["wind_mean"].mean()),
    }
