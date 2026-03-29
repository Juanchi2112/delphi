# Delphi — Descripción Completa del Proyecto

## Qué es

Delphi es una plataforma de inteligencia fitosanitaria predictiva que anticipa brotes de chicharrita del maíz (Dalbulus maidis) en Argentina usando machine learning sobre datos climáticos y de monitoreo público. Es, en esencia, **el pronóstico del tiempo para plagas agrícolas**.

## El problema

La chicharrita del maíz es el vector del achaparramiento (corn stunt), una enfermedad que puede reducir el rendimiento del maíz entre 70% y 100%. En la campaña 2023/24 causó pérdidas por **USD 2.500 millones** en Argentina, reduciendo la producción nacional de 67Mt proyectados a 49Mt.

Hoy la detección es completamente reactiva: una red de 330+ trampas amarillas pegajosas distribuidas en todo el país se revisa manualmente cada 15 días, y los resultados se publican en informes PDF. No existe ninguna herramienta que prediga el riesgo ANTES de que la plaga llegue. Los productores toman la decisión más importante del año — qué proporción de maíz sembrar temprano vs tardío, qué híbrido elegir, cuánto invertir en protección — a ciegas.

## La solución

Delphi tiene dos capas:

**Capa 1 — Predicción pre-campaña (agosto-septiembre).** Antes de que el productor siembre, el modelo genera un score de riesgo (0-100) para cada localidad de la zona maicera argentina. El modelo está entrenado con datos reales de la Red Nacional de Trampas de Monitoreo (330+ localidades, 37 informes quincenales, 2 campañas) cruzados con datos climáticos históricos de Open-Meteo. El productor ve un mapa de riesgo, entiende los factores que lo explican (vía SHAP), y toma decisiones informadas.

**Capa 2 — Monitoreo quincenal durante la campaña (septiembre-marzo).** Una vez que arranca la campaña, el score se actualiza cada 15 días incorporando capturas reales de trampas en la zona y localidades vecinas, condiciones climáticas recientes, y estado fenológico estimado del cultivo. El productor recibe alertas cuando el riesgo sube.

## Cómo funciona el modelo

### Target
Para cada localidad × temporada (julio a junio), el target es el **máximo de capturas de chicharrita por trampa** registrado durante esa temporada en esa localidad, binarizado: ≥5 adultos/trampa en algún momento = temporada problemática (1), caso contrario = 0. Los datos vienen directamente de los informes de la Red Nacional de Trampas de Monitoreo publicados por INTA/EEAOC, que reportan capturas numéricas exactas por localidad cada 15 días.

### Features
Todas las features usan datos disponibles **antes del inicio de la campaña** (junio-agosto):

**Features térmicas del invierno (las más predictivas):** cantidad de heladas, heladas severas (<-6°C), temperatura mínima absoluta, temperatura media invernal, días con mínima >15°C y >18°C, grados-día acumulados. La lógica: el umbral vital de la chicharrita es -6°C durante 6+ horas — inviernos crudos destruyen >90% de la población, inviernos suaves la preservan. Fuente: Open-Meteo Historical Weather API (gratis, sin API key, datos desde 1940).

**Features de la campaña anterior:** rendimiento relativo (proxy de daño previo), si la temporada anterior fue problemática, ratio de superficie cosechada/sembrada. Fuente: MAGyP Open Data.

**Features climáticas de escala global:** índice ENSO (ONI) — El Niño trae inviernos suaves en la pampa, La Niña trae inviernos crudos. Fuente: NOAA (archivo de texto público).

**Features geográficas:** latitud, longitud, distancia a la zona endémica permanente (NOA), altitud.

**Features espaciales (vecinos):** capturas máximas y promedio en localidades dentro de 100-200km, capturas en localidades al norte (dirección de migración), distancia al foco activo más cercano. La chicharrita migra de norte a sur — lo que pasa en tus vecinos del norte predice lo que te va a pasar a vos.

**Features de humedad y viento:** precipitación acumulada, humedad relativa promedio, velocidad y dirección del viento (proxy de migración). Validado por paper brasileño (Istchuk et al. 2025, International Journal of Biometeorology).

### Modelo
LightGBM (gradient boosting) con clasificación binaria y output probabilístico. Regularización fuerte por dataset chico (~660 observaciones con 2 campañas, creciente con cada campaña nueva). Validación con Leave-One-Season-Out cross-validation. Explicabilidad con SHAP values que permiten mostrar al usuario exactamente qué factores empujan el riesgo para arriba o para abajo.

### Referencia académica
Istchuk et al. (2025), "Forewarning the seasonal dynamics of corn leafhopper and mollicutes through neural networks", International Journal of Biometeorology. Usaron redes neuronales artificiales con variables climáticas (temperatura, humedad, viento) para predecir abundancia de D. maidis en 4 localidades de Brasil durante 4 años, logrando correlación de 0.71 para abundancia y accuracy de 0.81 para clasificación de infección. Nuestro enfoque usa el mismo tipo de features climáticas pero con un dataset mucho mayor (330+ localidades vs 4), un modelo más interpretable (LightGBM + SHAP vs ANN), y agrega features espaciales de vecinos y features del invierno previo.

## El producto

### Frontend (React/Next.js deployado en Vercel)
1. **Mapa interactivo de riesgo** — Todas las localidades de la Red Nacional coloreadas por score (verde→rojo). Click en localidad abre panel de detalle.
2. **Panel de explicabilidad (SHAP)** — Waterfall chart mostrando qué factores suben/bajan el riesgo para la localidad seleccionada.
3. **Timeline de evolución** — Gráfico de línea con el score quincenal a lo largo de la campaña.
4. **"Tu zona"** — Input de coordenadas → consulta Open-Meteo en tiempo real → predicción personalizada.
5. **Métricas del modelo** — AUC-ROC, feature importance, confusion matrix.
6. **Modelo de negocio** — Tiers de pricing y visión de expansión.

### Backend (FastAPI deployado en Railway)
- Endpoints REST que sirven datos pre-calculados (scores, SHAP, capturas, métricas)
- Un endpoint de predicción en tiempo real que consulta Open-Meteo, calcula features, y corre el modelo
- Sin base de datos: todo en archivos JSON cargados en memoria (~660 filas de dataset + 330 localidades)

### Pipeline de datos (se ejecuta una vez para preparar los datos)
1. Scraping de 37 PDFs del INTA → tabla de capturas por localidad × informe
2. Geocoding de 330+ localidades con Nominatim
3. Consulta a Open-Meteo para features climáticas de cada localidad × temporada
4. Consulta a NOAA para índice ENSO
5. Feature engineering (heladas, grados-día, features de vecinos, etc.)
6. Entrenamiento de LightGBM + cálculo de SHAP values
7. Serialización de modelo, scores, y SHAP a archivos JSON

## APIs utilizadas (todas gratuitas, sin API key)

| API | Datos | Uso |
|-----|-------|-----|
| Open-Meteo Historical | Clima diario desde 1940, resolución ~10km | Features climáticas del invierno y primavera |
| Open-Meteo Forecast | Pronóstico hasta 16 días | Predicción en tiempo real para "Tu zona" |
| NOAA ONI | Índice ENSO trimestral | Feature de El Niño/La Niña |
| Nominatim (OpenStreetMap) | Geocoding | Obtener coordenadas de localidades |
| INTA PDFs (argentina.gob.ar) | Informes de trampas | Target: capturas por localidad |

## Modelo de negocio

**Suscripción mensual durante campaña (septiembre-marzo = 7 meses):**
- **Gratuito:** Mapa general de riesgo por región (5 regiones)
- **Productor (USD 3-5/mes):** Score por localidad, alertas por WhatsApp/email, recomendaciones
- **Asesor/Cooperativa (USD 50-100/mes):** Múltiples lotes, reportes PDF, dashboard completo
- **Corporativo — Semilleros (USD 500-2000/mes):** API, inteligencia de mercado por región
- **Corporativo — Aseguradoras:** Risk scoring para pricing de pólizas

**Mercado:**
- Argentina: 6.5M ha de maíz, 250.000 productores → TAM USD 5-10M/año
- LATAM (Brasil, México, Colombia): misma plaga → TAM USD 50-100M/año
- Global (AI en agricultura): USD 4.700M en 2024, creciendo 26% anual

## Diferenciación competitiva

Las soluciones existentes son **reactivas** (Plantix: foto de planta enferma → diagnóstico post-hoc) o requieren **hardware caro** (Trapview, FarmSense: trampas IoT en cada campo). Delphi es **predictivo** (anticipa antes de que llegue) y **software puro** (sin hardware, datos públicos, escala sin costo marginal por usuario).

Nadie en el mundo hace predicción pre-campaña de riesgo de chicharrita basada en ML. El paper brasileño más cercano (Istchuk et al. 2025) usa 4 localidades — nosotros usamos 330+. Plantix declaró que pest forecasting es su "próxima frontera" pero aún no lo implementaron. Nosotros lo estamos construyendo.

## Moat competitivo

1. **Dataset propietario:** Cada campaña suma ~330 observaciones nuevas con capturas reales. En 5 años el dataset es irremplazable.
2. **Conocimiento de dominio codificado:** Features basadas en biología del vector (no features genéricas). Un agrónomo puede leer la explicación SHAP y decir "esto tiene sentido".
3. **Network effects potenciales:** Si suscriptores reportan capturas desde su campo (crowdsourcing), la densidad de datos se multiplica vs las 330 localidades fijas de la Red Nacional.
4. **Expansión horizontal:** Misma arquitectura para otras plagas (cogollero, roya, langosta) y otros países (Brasil, México, EEUU donde la chicharrita apareció en 2024).

## Equipo

4 estudiantes de 4to año de Ingeniería en AI, Universidad de San Andrés. Fortalezas en ML, deep learning, computer vision, NLP, agentes de AI, y desarrollo acelerado con Claude Code.

## Contexto: HackITBA 2026

Hackathon de 36 horas (27-29 marzo 2026). Categoría AI & Automatization. 3 finalistas por categoría → pitch ante jueces → 1 ganador entre 9 finalistas. Premio: viaje a Silicon Valley + potencial inversión de USD 200K por 7% de equity. Jueces incluyen representantes de NXTP Ventures (VC líder LATAM), Nuvemshop, IOL Inversiones, Bull Market Brokers, YPF, Plaude, y Digbang.
