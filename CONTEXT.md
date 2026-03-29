# Delphi — Pipeline de Datos y APIs

## Arquitectura general

```
DATOS DE TRAMPAS (PDFs INTA)          DATOS CLIMÁTICOS (Open-Meteo API)
        ↓                                        ↓
   Scraping + parsing                    Consulta por localidad
        ↓                                        ↓
   Target: max capturas               Features: temp, humedad, 
   por localidad por temporada         viento, precipitación
        ↓                                        ↓
        └──────────── MERGE ──────────────────────┘
                        ↓
              Dataset tabular final
              (localidad × temporada)
                        ↓
                   LightGBM / XGBoost
                        ↓
              Score de riesgo 0-1 + SHAP
```

---

## Definición de temporada

Una **temporada** va de **julio del año N** a **junio del año N+1**.

- **Julio - Agosto**: invierno, monitoreo de población remanente
- **Septiembre - Octubre**: siembra temprana, primeras detecciones
- **Noviembre - Diciembre**: siembra tardía, población creciendo
- **Enero - Marzo**: pico de campaña, máxima presión
- **Abril - Junio**: fin de campaña, decline

Temporadas disponibles en la Red Nacional:
- **Temporada 2024**: julio 2024 → junio 2025 (informes 1-21)
- **Temporada 2025**: julio 2025 → marzo 2026+ (informes 22-37+)

---

## 1. Datos de trampas (TARGET)

### Fuente
PDFs publicados por el INTA en argentina.gob.ar

### URLs (patrón predecible)
```python
# Informes 2024 (N° 1-10)
urls_2024 = [
    "https://www.argentina.gob.ar/sites/default/files/2024/08/1deg_informe_sobre_red_nacional_de_monitoreo_de_dalbulus_maidis.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/2do_informe_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/3er_informe_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/4to_informe_red_nacional_de_monitoreo_.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/5to_informe_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/6to_informe_red_nacional_de_monitoreo_.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/7mo_informe_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/8vo_informe_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/9no_informe_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/10mo_informe_red_nacional_de_monitoreo_.pdf",
]

# Informes 2025 (N° 11-21)
urls_2025 = [
    "https://www.argentina.gob.ar/sites/default/files/2024/08/11_informe_red_nacional_de_monitoreo_.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/12_informe_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/13deg_informe_red_nacional_de_monitoreo_d._maidis.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/14_informe_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/15_informe_de_la_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/16_informe_de_la_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/17_informe_de_la_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/18_informe_de_la_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/19_informe_de_la_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/20_informe_de_la_red_nacional_de_monitoreo.pdf",
    "https://www.argentina.gob.ar/sites/default/files/2024/08/21_informe_de_la_red_nacional_de_monitoreo.pdf",
]

# Informes 2025-2026 (N° 22-37+) — publicados en EEAOC, buscar URLs en:
# https://www.eeaoc.gob.ar/?s=informe+red+nacional+monitoreo+chicharrita
```

### Estructura de datos dentro de cada PDF
Cada informe contiene tablas por región con columnas:
- `#Loc` (número de localidad)
- `Institución` (INTA, EEAOC, CREA, etc.)
- `Provincia`
- `Localidad` (nombre del pueblo/ciudad)
- `N° adultos D. maidis/trampa` (número exacto de capturas)

### Scraping strategy
```python
# Opción A: Extraer con PyMuPDF + regex/tabula
import fitz  # PyMuPDF

def extract_trap_data(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    # Parsear tablas con regex o enviar a Claude API para extracción
    return text

# Opción B: Enviar cada PDF a Claude API para extracción estructurada
import anthropic

client = anthropic.Anthropic()

def extract_with_claude(pdf_path):
    # Leer PDF como base64
    with open(pdf_path, "rb") as f:
        pdf_base64 = base64.b64encode(f.read()).decode()
    
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4000,
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {"type": "base64", "media_type": "application/pdf", "data": pdf_base64}
                },
                {
                    "type": "text", 
                    "text": """Extraé todas las tablas de capturas de Dalbulus maidis de este informe.
                    Para cada localidad, devolvé un JSON con:
                    {"region": str, "provincia": str, "localidad": str, "capturas": int, "institucion": str}
                    Devolvé SOLO el JSON array, sin texto adicional."""
                }
            ]
        }]
    )
    return json.loads(response.content[0].text)
```

### Construcción del target
```python
import pandas as pd

def build_target(all_reports_df):
    """
    all_reports_df tiene columnas: 
    localidad, provincia, region, fecha_informe, capturas, temporada
    
    Para cada localidad × temporada, el target es el máximo de capturas.
    """
    target = (all_reports_df
        .groupby(['localidad', 'provincia', 'region', 'temporada'])
        .agg(
            max_capturas=('capturas', 'max'),
            mean_capturas=('capturas', 'mean'),
            n_informes=('capturas', 'count'),
            n_informes_con_deteccion=('capturas', lambda x: (x > 0).sum())
        )
        .reset_index()
    )
    
    # Target binario: ≥5 adultos/trampa en algún momento = problemática
    target['target_5'] = (target['max_capturas'] >= 5).astype(int)
    # Target binario alternativo: ≥20 adultos/trampa
    target['target_20'] = (target['max_capturas'] >= 20).astype(int)
    
    return target
```

---

## 2. Datos climáticos históricos (FEATURES)

### Fuente: Open-Meteo Historical Weather API
- **URL**: `https://archive-api.open-meteo.com/v1/archive`
- **Sin API key**
- **Datos desde 1940**
- **Resolución**: ~10-25 km (ERA5/ERA5-Land)
- **Rate limit**: ~10.000 requests/día en el tier gratuito

### Variables disponibles (matching con paper brasileño)
```python
DAILY_VARIABLES = [
    "temperature_2m_max",      # Temperatura máxima diaria (°C)
    "temperature_2m_min",      # Temperatura mínima diaria (°C) 
    "temperature_2m_mean",     # Temperatura media diaria (°C)
    "relative_humidity_2m_max",
    "relative_humidity_2m_min",
    "relative_humidity_2m_mean",
    "precipitation_sum",       # Precipitación acumulada (mm)
    "wind_speed_10m_max",      # Velocidad máxima del viento (km/h)
    "wind_speed_10m_mean",     # Velocidad media del viento  
    "wind_direction_10m_dominant",  # Dirección dominante del viento (°)
]
```

### Función de consulta
```python
import openmeteo_requests
import pandas as pd
from datetime import datetime

def get_historical_weather(lat, lon, start_date, end_date):
    """
    Consulta datos históricos de Open-Meteo para una coordenada.
    
    Args:
        lat: latitud (-35.0 para Buenos Aires)
        lon: longitud (-58.0 para Buenos Aires)
        start_date: "2024-06-01"
        end_date: "2024-08-31"
    
    Returns:
        DataFrame con datos diarios
    """
    url = "https://archive-api.open-meteo.com/v1/archive"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": start_date,
        "end_date": end_date,
        "daily": [
            "temperature_2m_max", "temperature_2m_min", "temperature_2m_mean",
            "relative_humidity_2m_max", "relative_humidity_2m_min", "relative_humidity_2m_mean",
            "precipitation_sum",
            "wind_speed_10m_max", "wind_speed_10m_mean",
            "wind_direction_10m_dominant",
        ],
        "timezone": "America/Argentina/Buenos_Aires",
    }
    
    # Usando requests directamente (sin librería openmeteo_requests)
    import requests
    response = requests.get(url, params=params)
    data = response.json()
    
    df = pd.DataFrame({
        "date": pd.to_datetime(data["daily"]["time"]),
        "temp_max": data["daily"]["temperature_2m_max"],
        "temp_min": data["daily"]["temperature_2m_min"],
        "temp_mean": data["daily"]["temperature_2m_mean"],
        "rh_max": data["daily"]["relative_humidity_2m_max"],
        "rh_min": data["daily"]["relative_humidity_2m_min"],
        "rh_mean": data["daily"]["relative_humidity_2m_mean"],
        "precip": data["daily"]["precipitation_sum"],
        "wind_max": data["daily"]["wind_speed_10m_max"],
        "wind_mean": data["daily"]["wind_speed_10m_mean"],
        "wind_dir": data["daily"]["wind_direction_10m_dominant"],
    })
    
    return df
```

### Feature engineering desde datos climáticos
```python
def compute_winter_features(weather_df, winter_start="06-01", winter_end="08-31"):
    """
    Calcula features del invierno (junio-agosto) para predecir la temporada siguiente.
    
    Input: DataFrame diario de Open-Meteo para el período de invierno
    Output: Dict con features calculadas
    """
    w = weather_df.copy()
    
    features = {
        # === FEATURES TÉRMICAS (las más predictivas según biología) ===
        
        # Heladas
        "heladas_count": (w["temp_min"] < 0).sum(),
        "heladas_severas_count": (w["temp_min"] < -6).sum(),
        "temp_min_abs": w["temp_min"].min(),
        
        # Temperatura general del invierno
        "temp_media_invierno": w["temp_mean"].mean(),
        "temp_min_media_invierno": w["temp_min"].mean(),
        
        # Días "tibios" donde la chicharrita puede estar activa
        "dias_tmin_gt_10": (w["temp_min"] > 10).sum(),
        "dias_tmin_gt_15": (w["temp_min"] > 15).sum(),
        "dias_tmin_gt_18": (w["temp_min"] > 18).sum(),
        
        # Grados-día (acumulación térmica para desarrollo del insecto)
        "gdd_base10": w["temp_mean"].apply(lambda x: max(0, x - 10)).sum(),
        "gdd_base0_negativo": w["temp_min"].apply(lambda x: min(0, x)).sum(),  # Frío acumulado
        
        # === FEATURES DE HUMEDAD ===
        "rh_mean_invierno": w["rh_mean"].mean(),
        "precip_total_invierno": w["precip"].sum(),
        "dias_con_lluvia": (w["precip"] > 1).sum(),
        
        # === FEATURES DE VIENTO (proxy de migración) ===
        "wind_mean_invierno": w["wind_mean"].mean(),
        "wind_max_invierno": w["wind_max"].max(),
        
        # Componente norte del viento (indica migración desde zona endémica)
        # Viento del norte = 0° o 360°, convertir a componente N-S
        "wind_norte_ratio": (
            ((w["wind_dir"] >= 315) | (w["wind_dir"] <= 45)).sum() / len(w)
        ),
    }
    
    return features


def compute_spring_features(weather_df, spring_start="09-01", spring_end="10-31"):
    """
    Features de primavera temprana (septiembre-octubre).
    Disponibles al momento de la predicción si predecimos a fines de octubre.
    """
    s = weather_df.copy()
    
    features = {
        "temp_media_primavera": s["temp_mean"].mean(),
        "temp_min_media_primavera": s["temp_min"].mean(),
        "dias_tmin_gt_15_primavera": (s["temp_min"] > 15).sum(),
        "dias_tmin_gt_18_primavera": (s["temp_min"] > 18).sum(),
        "gdd_base10_primavera": s["temp_mean"].apply(lambda x: max(0, x - 10)).sum(),
        "rh_mean_primavera": s["rh_mean"].mean(),
        "precip_total_primavera": s["precip"].sum(),
        "wind_mean_primavera": s["wind_mean"].mean(),
    }
    
    return features
```

---

## 3. Datos climáticos de pronóstico (FEATURES adicionales)

### Fuente: Open-Meteo Forecast API
- **URL**: `https://api.open-meteo.com/v1/forecast`
- **Horizonte**: hasta 16 días en el futuro
- **Para predicción en producción**: consultar en agosto/septiembre para tener pronóstico de las primeras semanas de campaña

### Fuente: Open-Meteo Seasonal Forecast API
- **URL**: `https://seasonal-api.open-meteo.com/v1/seasonal`
- **Horizonte**: hasta 9 meses en el futuro (modelos CFS, ECMWF)
- **Variables**: temperatura y precipitación mensual proyectada
- **Uso**: en agosto, obtener pronóstico de temperatura para septiembre-febrero

```python
def get_seasonal_forecast(lat, lon):
    """
    Obtiene pronóstico estacional (meses futuros) para la coordenada.
    Útil para predecir si la campaña va a tener condiciones favorables para la chicharrita.
    """
    url = "https://seasonal-api.open-meteo.com/v1/seasonal"
    params = {
        "latitude": lat,
        "longitude": lon,
        "daily": ["temperature_2m_max", "temperature_2m_min"],
        # Los modelos estacionales dan datos mensuales/semanales a futuro
    }
    import requests
    response = requests.get(url, params=params)
    return response.json()
```

---

## 4. Índice ENSO / ONI (FEATURE)

### Fuente: NOAA Climate Prediction Center
- **URL datos históricos**: `https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt`
- **Formato**: texto plano con tabla de ONI por trimestre
- **Actualización**: mensual

```python
def get_oni_data():
    """
    Descarga el índice ONI (Oceanic Niño Index) de NOAA.
    Devuelve DataFrame con año, trimestre, y valor ONI.
    
    ONI > 0.5 = El Niño (inviernos más suaves en Argentina → más supervivencia chicharrita)
    ONI < -0.5 = La Niña (inviernos más crudos → menos supervivencia)
    """
    import requests
    
    url = "https://www.cpc.ncep.noaa.gov/data/indices/oni.ascii.txt"
    response = requests.get(url)
    
    lines = response.text.strip().split('\n')
    records = []
    for line in lines[1:]:  # Skip header
        parts = line.split()
        if len(parts) >= 4:
            year = int(parts[0])
            season = parts[1]  # e.g., "DJF", "JFM", etc.
            oni = float(parts[-1])
            records.append({"year": year, "season": season, "oni": oni})
    
    return pd.DataFrame(records)


def get_oni_for_winter(year):
    """
    Obtiene el ONI promedio del invierno argentino (JJA = Jun-Jul-Aug).
    """
    oni_df = get_oni_data()
    # JJA corresponde al trimestre "JJA" en el archivo NOAA
    jja = oni_df[(oni_df["year"] == year) & (oni_df["season"] == "JJA")]
    if len(jja) > 0:
        return jja.iloc[0]["oni"]
    return None
```

---

## 5. Coordenadas de localidades (GEOGRÁFICAS)

### Fuente: Nominatim / OpenStreetMap (geocoding gratuito)
- **URL**: `https://nominatim.openstreetmap.org/search`
- **Rate limit**: 1 request/segundo

```python
import time

def geocode_localidad(localidad, provincia, country="Argentina"):
    """
    Obtiene latitud y longitud de una localidad argentina.
    """
    import requests
    
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": f"{localidad}, {provincia}, {country}",
        "format": "json",
        "limit": 1,
    }
    headers = {"User-Agent": "Delphi-Hackathon/1.0"}
    
    response = requests.get(url, params=params, headers=headers)
    results = response.json()
    
    if results:
        return {
            "lat": float(results[0]["lat"]),
            "lon": float(results[0]["lon"]),
        }
    return None


def geocode_all_localidades(localidades_df):
    """
    Geocodifica todas las localidades del dataset.
    Cachea resultados para no repetir requests.
    """
    cache = {}
    for _, row in localidades_df.iterrows():
        key = f"{row['localidad']}_{row['provincia']}"
        if key not in cache:
            coords = geocode_localidad(row['localidad'], row['provincia'])
            cache[key] = coords
            time.sleep(1.1)  # Respetar rate limit de Nominatim
    
    return cache
```

---

## 6. Pipeline completo: ensamblaje del dataset

```python
def build_full_dataset(trap_data, localidad_coords):
    """
    Construye el dataset final para entrenamiento.
    
    Cada fila = (localidad, temporada)
    Columnas = features climáticas del invierno + geográficas + ONI + target
    """
    rows = []
    
    for (localidad, temporada), group in trap_data.groupby(['localidad', 'temporada']):
        # --- TARGET ---
        max_capturas = group['capturas'].max()
        target = 1 if max_capturas >= 5 else 0
        
        # --- COORDENADAS ---
        key = f"{localidad}_{group.iloc[0]['provincia']}"
        coords = localidad_coords.get(key)
        if coords is None:
            continue
        lat, lon = coords['lat'], coords['lon']
        
        # --- FEATURES CLIMÁTICAS DEL INVIERNO ---
        # El invierno previo a la temporada
        year = temporada  # temporada 2024 = julio 2024 → junio 2025
        winter_start = f"{year}-06-01"
        winter_end = f"{year}-08-31"
        
        weather = get_historical_weather(lat, lon, winter_start, winter_end)
        winter_feats = compute_winter_features(weather)
        
        # --- FEATURES DE PRIMAVERA TEMPRANA ---
        spring_start = f"{year}-09-01"
        spring_end = f"{year}-10-31"
        
        spring_weather = get_historical_weather(lat, lon, spring_start, spring_end)
        spring_feats = compute_spring_features(spring_weather)
        
        # --- ENSO ---
        oni = get_oni_for_winter(year)
        
        # --- GEOGRÁFICAS ---
        # Distancia a zona endémica (Tucumán: -26.8, -65.2)
        from math import radians, sin, cos, sqrt, atan2
        def haversine(lat1, lon1, lat2, lon2):
            R = 6371
            dlat = radians(lat2 - lat1)
            dlon = radians(lon2 - lon1)
            a = sin(dlat/2)**2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2)**2
            return R * 2 * atan2(sqrt(a), sqrt(1-a))
        
        dist_endemica = haversine(lat, lon, -26.8, -65.2)
        
        # --- ENSAMBLAR FILA ---
        row = {
            'localidad': localidad,
            'provincia': group.iloc[0]['provincia'],
            'region': group.iloc[0]['region'],
            'temporada': temporada,
            'lat': lat,
            'lon': lon,
            'dist_zona_endemica_km': dist_endemica,
            'oni_invierno': oni,
            **winter_feats,
            **spring_feats,
            'max_capturas': max_capturas,
            'target': target,
        }
        rows.append(row)
    
    return pd.DataFrame(rows)
```

---

## 7. Entrenamiento del modelo

```python
import lightgbm as lgb
from sklearn.model_selection import GroupKFold
from sklearn.metrics import roc_auc_score, classification_report
import shap
import numpy as np

def train_model(df):
    """
    Entrena LightGBM con validación temporal.
    """
    # Separar features y target
    feature_cols = [c for c in df.columns if c not in [
        'localidad', 'provincia', 'region', 'temporada', 
        'max_capturas', 'target'
    ]]
    
    X = df[feature_cols]
    y = df['target']
    groups = df['temporada']  # Para split temporal
    
    # --- Leave-One-Season-Out Cross-Validation ---
    gkf = GroupKFold(n_splits=len(df['temporada'].unique()))
    
    scores = []
    models = []
    
    for train_idx, test_idx in gkf.split(X, y, groups):
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
        
        model = lgb.LGBMClassifier(
            n_estimators=200,
            max_depth=4,
            num_leaves=15,
            learning_rate=0.05,
            min_child_samples=10,
            subsample=0.8,
            colsample_bytree=0.7,
            reg_alpha=1.0,
            reg_lambda=1.0,
            class_weight='balanced',
            random_state=42,
            verbose=-1,
        )
        
        model.fit(X_train, y_train)
        
        y_pred_proba = model.predict_proba(X_test)[:, 1]
        
        if len(y_test.unique()) > 1:
            auc = roc_auc_score(y_test, y_pred_proba)
            scores.append(auc)
            print(f"Temporada {groups.iloc[test_idx].values[0]}: AUC = {auc:.3f}")
        
        models.append(model)
    
    print(f"\nMean AUC: {np.mean(scores):.3f} ± {np.std(scores):.3f}")
    
    # --- Modelo final entrenado con todos los datos ---
    final_model = lgb.LGBMClassifier(
        n_estimators=200, max_depth=4, num_leaves=15,
        learning_rate=0.05, min_child_samples=10,
        subsample=0.8, colsample_bytree=0.7,
        reg_alpha=1.0, reg_lambda=1.0,
        class_weight='balanced', random_state=42, verbose=-1,
    )
    final_model.fit(X, y)
    
    # --- SHAP values ---
    explainer = shap.TreeExplainer(final_model)
    shap_values = explainer.shap_values(X)
    
    return final_model, explainer, shap_values, feature_cols


def predict_risk(model, localidad_lat, localidad_lon, year):
    """
    Genera predicción de riesgo para una localidad y temporada futura.
    
    Llama a Open-Meteo para obtener datos climáticos actuales,
    calcula features, y corre el modelo.
    """
    # 1. Obtener datos del invierno actual
    weather = get_historical_weather(
        localidad_lat, localidad_lon,
        f"{year}-06-01", f"{year}-08-31"
    )
    winter_feats = compute_winter_features(weather)
    
    # 2. Si estamos en septiembre+, agregar features de primavera
    spring_feats = {}
    today = datetime.now()
    if today.month >= 10:
        spring_weather = get_historical_weather(
            localidad_lat, localidad_lon,
            f"{year}-09-01", f"{year}-10-31"
        )
        spring_feats = compute_spring_features(spring_weather)
    
    # 3. ONI
    oni = get_oni_for_winter(year)
    
    # 4. Geográficas
    dist_endemica = haversine(localidad_lat, localidad_lon, -26.8, -65.2)
    
    # 5. Ensamblar features
    features = {
        'lat': localidad_lat,
        'lon': localidad_lon,
        'dist_zona_endemica_km': dist_endemica,
        'oni_invierno': oni,
        **winter_feats,
        **spring_feats,
    }
    
    # 6. Predecir
    X_pred = pd.DataFrame([features])
    risk_score = model.predict_proba(X_pred)[:, 1][0]
    
    return risk_score
```

---

## Resumen de APIs

| API | URL base | Auth | Datos | Uso |
|-----|----------|------|-------|-----|
| **Open-Meteo Historical** | `archive-api.open-meteo.com/v1/archive` | Sin key | Clima diario desde 1940, global, ~10km res | Features climáticas del invierno y primavera |
| **Open-Meteo Forecast** | `api.open-meteo.com/v1/forecast` | Sin key | Pronóstico hasta 16 días | Features de pronóstico en producción |
| **Open-Meteo Seasonal** | `seasonal-api.open-meteo.com/v1/seasonal` | Sin key | Pronóstico estacional (meses) | Feature de pronóstico de largo plazo |
| **NOAA ONI** | `cpc.ncep.noaa.gov/data/indices/oni.ascii.txt` | Sin key | Índice ENSO trimestral | Feature ENSO |
| **Nominatim** | `nominatim.openstreetmap.org/search` | Sin key (1 req/s) | Geocoding de localidades | Obtener lat/lon de cada localidad |
| **INTA PDFs** | `argentina.gob.ar/sites/default/files/...` | Sin key | Informes de trampas (PDF) | Target: capturas por localidad |

Todas las APIs son **gratuitas y sin necesidad de API key** para el volumen de datos que necesitamos.