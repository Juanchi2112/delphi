from __future__ import annotations

import json
from typing import Any

from openai import OpenAI

FEATURE_LABELS: dict[str, str] = {
    "dist_zona_endemica_km": "Distancia a zona endemica",
    "temp_media_invierno": "Temp. media invernal",
    "gdd_base10_primavera": "Grados-dia primavera",
    "heladas_count": "Dias con heladas",
    "heladas_severas_count": "Heladas severas (<-6C)",
    "oni_invierno": "Indice ENSO (ONI)",
    "precip_total_invierno": "Precipitacion invernal",
    "precip_total_primavera": "Precipitacion primavera",
    "wind_norte_ratio": "Ratio viento norte",
    "dias_tmin_gt_15": "Dias con min. >15C",
    "dias_tmin_gt_18": "Dias con min. >18C",
    "temp_min_abs": "Temp. minima absoluta",
    "temp_media_primavera": "Temp. media primavera",
    "gdd_base10": "Grados-dia invierno",
    "wind_mean_invierno": "Viento medio invernal",
    "rh_mean_invierno": "Humedad relativa invernal",
    "n_outbreaks_within_100km": "Brotes en 100km",
    "n_outbreaks_within_200km": "Brotes en 200km",
    "dist_nearest_outbreak_km": "Dist. brote mas cercano",
    "prev_max_capturas": "Capturas max. temporada ant.",
    "prev_target": "Brote temporada anterior",
}

SYSTEM_PROMPT = """\
Sos un ingeniero agronomo experto en manejo integrado de plagas, \
especializado en Dalbulus maidis (chicharrita del maiz) en Argentina.

Contexto tecnico del modelo predictivo:
- El modelo usa features climaticas de invierno (heladas, GDD, temperaturas), \
indice ENSO (ONI), features geograficas (distancia a zona endemica en Tucuman) \
y features de brotes vecinos (brotes historicos en 100km y 200km).
- Las features SHAP indican la contribucion de cada variable a la prediccion. \
Un valor SHAP positivo incrementa el riesgo, uno negativo lo reduce.
- Significado de las features:
{feature_labels}

Categorias de decision para recomendaciones:
- fecha_siembra: ajuste de fecha de siembra para evadir picos de migracion
- hibrido: seleccion de hibridos tolerantes o con resistencia parcial
- proteccion: tratamiento de semillas y aplicaciones foliares de insecticidas
- monitoreo: frecuencia y metodo de monitoreo (trampas amarillas, recuento visual)
- rotacion: rotacion de cultivos y manejo del lote

Niveles de riesgo: low (< 0.35), medium (0.35-0.65), high (>= 0.65).

Tu respuesta DEBE ser un JSON valido con exactamente esta estructura:
{{
  "resumen": "Resumen de 2-3 oraciones sobre el nivel de riesgo y los factores principales.",
  "factores": [
    {{"factor": "nombre del factor", "impacto": "positivo|negativo", "explicacion": "por que importa"}}
  ],
  "recomendaciones": [
    {{"categoria": "fecha_siembra|hibrido|proteccion|monitoreo|rotacion", "accion": "que hacer", "justificacion": "por que", "prioridad": "alta|media|baja"}}
  ],
  "contexto_regional": "Parrafo sobre las localidades cercanas y patrones regionales."
}}

Reglas:
- Impacto "negativo" significa que el factor AUMENTA el riesgo de brote.
- Impacto "positivo" significa que el factor REDUCE el riesgo de brote.
- Incluir entre 3 y 6 factores, ordenados por relevancia (mayor |shap_value| primero).
- Incluir entre 3 y 5 recomendaciones, cubriendo al menos 3 categorias distintas.
- Prioridad "alta" para acciones urgentes, "media" para planificacion, "baja" para mejora continua.
- Adaptar las recomendaciones al nivel de riesgo: riesgo alto requiere acciones mas agresivas.
- El contexto regional debe mencionar localidades cercanas por nombre, sus niveles de riesgo, y si hay un patron geografico.
- Todo el texto debe estar en espanol rioplatense.
- NO incluyas texto fuera del JSON.
"""


class ReportGenerator:
    def __init__(self, api_key: str) -> None:
        self.api_key = api_key
        if api_key:
            self.client = OpenAI(api_key=api_key)
        else:
            self.client = None

    def generate(
        self,
        localidad: dict[str, Any],
        nearby: list[dict[str, Any]],
        campo_nombre: str | None = None,
        hectareas: float | None = None,
    ) -> dict[str, Any]:
        feature_labels_text = "\n".join(
            f"  - {k}: {v}" for k, v in FEATURE_LABELS.items()
        )
        system = SYSTEM_PROMPT.format(feature_labels=feature_labels_text)

        user_prompt = self._build_user_prompt(localidad, nearby, campo_nombre, hectareas)

        response = self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            response_format={"type": "json_object"},
        )

        return json.loads(response.choices[0].message.content)

    def _build_user_prompt(
        self,
        localidad: dict[str, Any],
        nearby: list[dict[str, Any]],
        campo_nombre: str | None,
        hectareas: float | None,
    ) -> str:
        parts: list[str] = []

        parts.append("## Datos de la localidad")
        parts.append(f"- Localidad: {localidad.get('localidad', 'N/A')}")
        parts.append(f"- Provincia: {localidad.get('provincia', 'N/A')}")
        parts.append(f"- Region: {localidad.get('region', 'N/A')}")
        parts.append(f"- Temporada: {localidad.get('temporada', 'N/A')}")
        parts.append(f"- Risk score: {localidad.get('risk_score', 'N/A')}")
        parts.append(f"- Risk level: {localidad.get('risk_level', 'N/A')}")

        if campo_nombre:
            parts.append(f"- Campo: {campo_nombre}")
        if hectareas is not None:
            parts.append(f"- Hectareas: {hectareas}")

        max_capturas = localidad.get("max_capturas")
        if max_capturas is not None:
            parts.append(f"- Capturas maximas: {max_capturas}")
        mean_capturas = localidad.get("mean_capturas")
        if mean_capturas is not None:
            parts.append(f"- Capturas promedio: {mean_capturas}")
        n_lecturas = localidad.get("n_lecturas")
        if n_lecturas is not None:
            parts.append(f"- Lecturas: {n_lecturas}")
        n_detecciones = localidad.get("n_detecciones")
        if n_detecciones is not None:
            parts.append(f"- Detecciones: {n_detecciones}")

        shap_features = localidad.get("shap_features", [])
        if shap_features:
            parts.append("\n## Features SHAP (contribucion al riesgo)")
            shap_base = localidad.get("shap_base_value")
            if shap_base is not None:
                parts.append(f"- Valor base SHAP: {shap_base:.4f}")
            for feat in shap_features:
                name = feat.get("name", "")
                label = FEATURE_LABELS.get(name, name)
                value = feat.get("value")
                shap_val = feat.get("shap_value", 0.0)
                val_str = f"{value}" if value is not None else "N/A"
                parts.append(f"- {label} ({name}): valor={val_str}, shap={shap_val:+.4f}")

        if nearby:
            parts.append("\n## 5 localidades mas cercanas")
            for loc in nearby:
                parts.append(
                    f"- {loc.get('localidad', 'N/A')} ({loc.get('provincia', 'N/A')}): "
                    f"risk_score={loc.get('risk_score', 'N/A')}, "
                    f"risk_level={loc.get('risk_level', 'N/A')}"
                )

        parts.append("\nGenera el informe JSON.")
        return "\n".join(parts)
