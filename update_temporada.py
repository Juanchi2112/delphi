#!/usr/bin/env python3
"""Update mapa_plagas.ipynb to add temporada (season) logic throughout all cells."""
import json

NB_PATH = 'mapa_plagas.ipynb'

with open(NB_PATH, 'r', encoding='utf-8') as f:
    nb = json.load(f)

def get_cell_by_id(nb, cell_id):
    for i, cell in enumerate(nb['cells']):
        meta = cell.get('metadata', {})
        cid = meta.get('id', '') or cell.get('id', '')
        if cid == cell_id:
            return i, cell
    return None, None

def set_source(cell, code):
    """Set cell source as list of lines."""
    lines = code.split('\n')
    source = []
    for j, line in enumerate(lines):
        if j < len(lines) - 1:
            source.append(line + '\n')
        else:
            source.append(line)
    cell['source'] = source

# ---- CELL 4: Data loading (#VSC-295e5872) ----
idx, cell = get_cell_by_id(nb, '#VSC-295e5872')
if cell is None:
    # Try without hash
    for i, c in enumerate(nb['cells']):
        src = ''.join(c.get('source', []))
        if 'df_all = pd.DataFrame(all_records)' in src and 'geocoding.json' in src:
            idx, cell = i, c
            break

if cell:
    old_src = ''.join(cell['source'])
    # Add temporada after sort
    old_end = """df_all = pd.DataFrame(all_records)
df_all = df_all.sort_values('fecha_inicio').reset_index(drop=True)

print(f"\\nTotal registros: {len(df_all)}")
print(f"Rango temporal: {df_all['fecha_inicio'].min().strftime('%Y-%m-%d')} \\u2192 {df_all['fecha_fin'].max().strftime('%Y-%m-%d')}")
print(f"Localidades \\u00fanicas: {df_all['localidad'].nunique()}")
print(f"Per\\u00edodos \\u00fanicos: {df_all['fecha_inicio'].nunique()}")
df_all.head(10)"""
    
    new_end = """df_all = pd.DataFrame(all_records)
df_all = df_all.sort_values('fecha_inicio').reset_index(drop=True)

# --- Asignar TEMPORADA (Ago->Mar) ---
def assign_temporada(fecha):
    if fecha.month >= 8:
        return f"{fecha.year}/{fecha.year + 1}"
    else:
        return f"{fecha.year - 1}/{fecha.year}"

df_all['temporada'] = df_all['fecha_inicio'].apply(assign_temporada)

print(f"\\nTotal registros: {len(df_all)}")
print(f"Rango temporal: {df_all['fecha_inicio'].min().strftime('%Y-%m-%d')} \\u2192 {df_all['fecha_fin'].max().strftime('%Y-%m-%d')}")
print(f"Localidades \\u00fanicas: {df_all['localidad'].nunique()}")
print(f"Per\\u00edodos \\u00fanicos: {df_all['fecha_inicio'].nunique()}")
print(f"\\nTemporadas: {sorted(df_all['temporada'].unique())}")
for t in sorted(df_all['temporada'].unique()):
    sub = df_all[df_all['temporada'] == t]
    print(f"  {t}: {len(sub)} registros, {sub['fecha_inicio'].min().strftime('%d/%m/%Y')} \\u2192 {sub['fecha_fin'].max().strftime('%d/%m/%Y')}")
df_all.head(10)"""
    
    # Just replace the tail portion
    if "assign_temporada" not in old_src:
        new_src = old_src.replace(
            "df_all = pd.DataFrame(all_records)\ndf_all = df_all.sort_values('fecha_inicio').reset_index(drop=True)\n\nprint(f\"\\nTotal registros: {len(df_all)}\")",
            "df_all = pd.DataFrame(all_records)\ndf_all = df_all.sort_values('fecha_inicio').reset_index(drop=True)\n\n# --- Asignar TEMPORADA (Ago->Mar) ---\ndef assign_temporada(fecha):\n    if fecha.month >= 8:\n        return f\"{fecha.year}/{fecha.year + 1}\"\n    else:\n        return f\"{fecha.year - 1}/{fecha.year}\"\n\ndf_all['temporada'] = df_all['fecha_inicio'].apply(assign_temporada)\n\nprint(f\"\\nTotal registros: {len(df_all)}\")"
        )
        # Add temporada print
        new_src = new_src.replace(
            "print(f\"Per\u00edodos \u00fanicos: {df_all['fecha_inicio'].nunique()}\")\ndf_all.head(10)",
            "print(f\"Per\u00edodos \u00fanicos: {df_all['fecha_inicio'].nunique()}\")\nprint(f\"\\nTemporadas: {sorted(df_all['temporada'].unique())}\")\nfor t in sorted(df_all['temporada'].unique()):\n    sub = df_all[df_all['temporada'] == t]\n    print(f\"  {t}: {len(sub)} registros, {sub['fecha_inicio'].min().strftime('%d/%m/%Y')} -> {sub['fecha_fin'].max().strftime('%d/%m/%Y')}\")\ndf_all.head(10)"
        )
        set_source(cell, new_src)
        print(f"[OK] Cell 4 (data loading) updated with temporada")
    else:
        print("[SKIP] Cell 4 already has temporada")
else:
    print("[ERROR] Could not find data loading cell")

# ---- CELL 6: Exploration (#VSC-cf7b557a) ----
for i, c in enumerate(nb['cells']):
    src = ''.join(c.get('source', []))
    if 'periodo_stats' in src and 'groupby' in src and 'Registros por per' in src:
        new_code = """# Estadísticas por temporada y período
for temp in sorted(df_all['temporada'].unique()):
    sub = df_all[df_all['temporada'] == temp]
    print(f"\\n{'='*60}")
    print(f"TEMPORADA {temp}")
    print(f"{'='*60}")
    periodo_stats = sub.groupby('fecha_inicio').agg(
        registros=('cantidad', 'count'),
        cantidad_total=('cantidad', 'sum'),
        cantidad_media=('cantidad', 'mean'),
        localidades=('localidad', 'nunique')
    ).reset_index()
    periodo_stats['fecha_str'] = periodo_stats['fecha_inicio'].dt.strftime('%d/%m/%Y')
    print(periodo_stats[['fecha_str', 'registros', 'cantidad_total', 'cantidad_media', 'localidades']].to_string(index=False))
    print(f"\\n--- Por zona ---")
    print(sub.groupby('zona')['cantidad'].agg(['count', 'sum', 'mean']).round(1))"""
        set_source(c, new_code)
        print(f"[OK] Cell {i} (exploration) updated")
        break

# ---- CELL 8: Animated map (#VSC-a3e72ade) ----
for i, c in enumerate(nb['cells']):
    src = ''.join(c.get('source', []))
    if 'scatter_map' in src and 'animation_frame' in src and 'YlOrRd' in src and 'riesgo' not in src:
        new_code = """# Un mapa animado POR TEMPORADA
temporadas = sorted(df_all['temporada'].unique())

for temp in temporadas:
    df_temp = df_all[df_all['temporada'] == temp].copy()
    df_temp['periodo'] = df_temp['fecha_inicio'].dt.strftime('%d/%m/%Y') + ' - ' + df_temp['fecha_fin'].dt.strftime('%d/%m/%Y')
    periodos_ord = df_temp.sort_values('fecha_inicio')['periodo'].unique().tolist()
    df_temp['periodo'] = pd.Categorical(df_temp['periodo'], categories=periodos_ord, ordered=True)
    df_temp['log_cantidad'] = np.log1p(df_temp['cantidad'])
    df_temp['hover'] = (df_temp['localidad'] + ', ' + df_temp['provincia'] + 
                        '<br>Cantidad: ' + df_temp['cantidad'].astype(int).astype(str) +
                        '<br>Zona: ' + df_temp['zona'])

    fig = px.scatter_map(
        df_temp,
        lat='lat', lon='lon',
        size='log_cantidad',
        color='cantidad',
        animation_frame='periodo',
        hover_name='hover',
        color_continuous_scale='YlOrRd',
        size_max=25, zoom=4,
        center=dict(lat=-32, lon=-62),
        map_style='carto-positron',
        title=f'Propagación de D. maidis — Temporada {temp}',
        height=800,
        range_color=[0, df_temp['cantidad'].quantile(0.95)]
    )
    fig.update_layout(
        coloraxis_colorbar_title='Capturas',
        margin=dict(l=0, r=0, t=40, b=0),
        sliders=[dict(currentvalue=dict(prefix="Período: "), pad=dict(t=20))]
    )
    fig.show()"""
        set_source(c, new_code)
        print(f"[OK] Cell {i} (animated map) updated")
        break

# ---- CELL 10: Heatmap (#VSC-a90aeed5) ----
for i, c in enumerate(nb['cells']):
    src = ''.join(c.get('source', []))
    if 'HeatMapWithTime' in src and 'heat_data' in src:
        new_code = """# Heatmap temporal POR TEMPORADA
from IPython.display import display

for temp in sorted(df_all['temporada'].unique()):
    df_temp = df_all[df_all['temporada'] == temp]
    periodos = sorted(df_temp['fecha_inicio'].unique())

    heat_data = []
    index_labels = []
    for periodo in periodos:
        subset = df_temp[df_temp['fecha_inicio'] == periodo]
        puntos = subset[['lat', 'lon', 'cantidad']].values.tolist()
        max_val = max(p[2] for p in puntos) if puntos else 1
        puntos_norm = [[p[0], p[1], p[2] / max_val if max_val > 0 else 0] for p in puntos]
        heat_data.append(puntos_norm)
        index_labels.append(pd.Timestamp(periodo).strftime('%d/%m/%Y'))

    m = folium.Map(location=[-32, -62], zoom_start=5, tiles='CartoDB positron')
    HeatMapWithTime(
        heat_data, index=index_labels, auto_play=True, max_opacity=0.8,
        radius=25, gradient={0.2: 'blue', 0.4: 'lime', 0.6: 'yellow', 0.8: 'orange', 1: 'red'},
        speed_step=1, position='bottomleft'
    ).add_to(m)
    print(f"\\n--- Heatmap Temporada {temp} ---")
    display(m)"""
        set_source(c, new_code)
        print(f"[OK] Cell {i} (heatmap) updated")
        break

# ---- CELL 12: TimestampedGeoJson (#VSC-4594fdc2) ----
for i, c in enumerate(nb['cells']):
    src = ''.join(c.get('source', []))
    if 'TimestampedGeoJson' in src and 'cantidad_to_color' in src:
        new_code = """# TimestampedGeoJson POR TEMPORADA
def cantidad_to_color(cant, max_cant):
    ratio = cant / max_cant if max_cant > 0 else 0
    if ratio < 0.1: return 'green'
    elif ratio < 0.3: return 'orange'
    else: return 'red'

for temp in sorted(df_all['temporada'].unique()):
    df_temp = df_all[df_all['temporada'] == temp]
    max_cant = df_temp['cantidad'].quantile(0.95)
    features = []
    for _, row in df_temp.iterrows():
        features.append({
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': [row['lon'], row['lat']]},
            'properties': {
                'time': row['fecha_inicio'].isoformat(),
                'popup': f"<b>{row['localidad']}</b><br>{row['provincia']}<br>Capturas: {int(row['cantidad'])}",
                'icon': 'circle',
                'iconstyle': {
                    'fillColor': cantidad_to_color(row['cantidad'], max_cant),
                    'fillOpacity': 0.7, 'stroke': 'true',
                    'radius': max(3, min(15, np.log1p(row['cantidad']) * 2)),
                    'weight': 1, 'color': '#333'
                },
                'style': {'weight': 0}
            }
        })
    geojson = {'type': 'FeatureCollection', 'features': features}
    m2 = folium.Map(location=[-32, -62], zoom_start=5, tiles='CartoDB positron')
    TimestampedGeoJson(
        geojson, period='P15D', add_last_point=True, auto_play=True,
        loop=True, max_speed=3, loop_button=True,
        date_options='DD/MM/YYYY', time_slider_drag_update=True
    ).add_to(m2)
    print(f"--- TimestampedGeoJson Temporada {temp} ---")
    display(m2)"""
        set_source(c, new_code)
        print(f"[OK] Cell {i} (timestamped geojson) updated")
        break

# ---- CELL 14: Velocity/centroid (#VSC-f90df460) ----
for i, c in enumerate(nb['cells']):
    src = ''.join(c.get('source', []))
    if 'haversine' in src and 'centroids' in src and 'vel_km_dia' in src:
        new_code = """from math import radians, cos, sin, asin, sqrt

def haversine(lat1, lon1, lat2, lon2):
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    return 2 * 6371 * asin(sqrt(a))

# Centroide y velocidad de propagación POR TEMPORADA
for temp in sorted(df_all['temporada'].unique()):
    df_temp = df_all[df_all['temporada'] == temp]
    centroids = []
    for fecha in sorted(df_temp['fecha_inicio'].unique()):
        sub = df_temp[df_temp['fecha_inicio'] == fecha]
        total = sub['cantidad'].sum()
        if total > 0:
            lat_c = (sub['lat'] * sub['cantidad']).sum() / total
            lon_c = (sub['lon'] * sub['cantidad']).sum() / total
        else:
            lat_c = sub['lat'].mean()
            lon_c = sub['lon'].mean()
        centroids.append({'fecha': fecha, 'lat': lat_c, 'lon': lon_c,
                          'total_capturas': total, 'n_localidades': len(sub)})

    df_centroids = pd.DataFrame(centroids).reset_index(drop=True)
    df_centroids['dist_km'] = 0.0
    df_centroids['dias'] = 0
    for i in range(1, len(df_centroids)):
        df_centroids.loc[i, 'dist_km'] = haversine(
            df_centroids.loc[i-1, 'lat'], df_centroids.loc[i-1, 'lon'],
            df_centroids.loc[i, 'lat'], df_centroids.loc[i, 'lon'])
        df_centroids.loc[i, 'dias'] = (df_centroids.loc[i, 'fecha'] - df_centroids.loc[i-1, 'fecha']).days
    df_centroids['vel_km_dia'] = df_centroids['dist_km'] / df_centroids['dias'].replace(0, np.nan)

    print(f"\\n{'='*60}")
    print(f"TEMPORADA {temp}")
    print(f"{'='*60}")

    fig1 = px.bar(df_centroids, x='fecha', y='total_capturas',
        title=f'Total de capturas por período — Temporada {temp}',
        labels={'fecha': 'Fecha inicio', 'total_capturas': 'Total capturas'})
    fig1.show()

    fig2 = px.line(df_centroids, x='fecha', y='dist_km', markers=True,
        title=f'Desplazamiento del centroide — Temporada {temp}',
        labels={'fecha': 'Fecha inicio', 'dist_km': 'Distancia (km)'})
    fig2.show()

    fig3 = px.scatter_map(df_centroids, lat='lat', lon='lon',
        size='total_capturas', color='fecha',
        hover_data=['total_capturas', 'n_localidades', 'dist_km'],
        map_style='carto-positron', zoom=4, center=dict(lat=-32, lon=-62),
        title=f'Trayectoria del centroide — Temporada {temp}', height=600)
    fig3.add_trace(go.Scattermap(
        lat=df_centroids['lat'], lon=df_centroids['lon'],
        mode='lines', line=dict(width=2, color='gray'),
        name='Trayectoria', showlegend=True))
    fig3.show()

    print(df_centroids[['fecha', 'lat', 'lon', 'total_capturas', 'dist_km', 'vel_km_dia']].to_string(index=False))"""
        set_source(c, new_code)
        print(f"[OK] Cell {i} (velocity) updated")
        break

# ---- CELL 16: Risk calculation (#VSC-0c47a62e) ----
for i, c in enumerate(nb['cells']):
    src = ''.join(c.get('source', []))
    if 'K_NEIGHBORS' in src and 'clasificar_alerta' in src:
        new_code = """# =============================================================
# 7. ALERTA DE RIESGO DE CONTAGIO POR VECINOS — POR TEMPORADA
# =============================================================

K_NEIGHBORS = 5
DIST_MAX_KM = 200
UMBRAL_RIESGO = 0.6

risk_results = {}

for temp in sorted(df_all['temporada'].unique()):
    df_temp = df_all[df_all['temporada'] == temp]
    print(f"\\n{'='*70}")
    print(f"TEMPORADA {temp}")
    print(f"{'='*70}")
    
    ultimos_periodos = sorted(df_temp['fecha_inicio'].unique())[-2:]
    periodo_actual = ultimos_periodos[-1]
    periodo_anterior = ultimos_periodos[0] if len(ultimos_periodos) > 1 else periodo_actual
    print(f"Período actual:   {pd.Timestamp(periodo_actual).strftime('%d/%m/%Y')}")
    print(f"Período anterior: {pd.Timestamp(periodo_anterior).strftime('%d/%m/%Y')}")

    df_actual = df_temp[df_temp['fecha_inicio'] == periodo_actual].copy()
    loc_actual = df_actual.groupby(['localidad', 'provincia', 'zona']).agg(
        lat=('lat', 'first'), lon=('lon', 'first'), cantidad=('cantidad', 'sum')
    ).reset_index()

    df_anterior = df_temp[df_temp['fecha_inicio'] == periodo_anterior].copy()
    loc_anterior = df_anterior.groupby(['localidad', 'provincia']).agg(
        cantidad_anterior=('cantidad', 'sum')
    ).reset_index()

    loc_actual = loc_actual.merge(loc_anterior[['localidad', 'provincia', 'cantidad_anterior']],
                                   on=['localidad', 'provincia'], how='left')
    loc_actual['cantidad_anterior'] = loc_actual['cantidad_anterior'].fillna(0)
    print(f"Localidades: {len(loc_actual)}")

    coords = loc_actual[['lat', 'lon']].values
    cantidades = loc_actual['cantidad'].values
    n = len(loc_actual)
    dist_matrix = np.zeros((n, n))
    for i in range(n):
        for j in range(i+1, n):
            d = haversine(coords[i][0], coords[i][1], coords[j][0], coords[j][1])
            dist_matrix[i][j] = d
            dist_matrix[j][i] = d

    riesgo_vecinal = []
    vecinos_info = []
    for i in range(n):
        dists_i = [(dist_matrix[i][j], cantidades[j], j) for j in range(n)
                   if j != i and 0 < dist_matrix[i][j] < DIST_MAX_KM]
        dists_i.sort(key=lambda x: x[0])
        k_nearest = dists_i[:K_NEIGHBORS]
        if k_nearest:
            weights = [1.0 / d[0] for d in k_nearest]
            total_weight = sum(weights)
            riesgo = sum(w * d[1] for w, d in zip(weights, k_nearest)) / total_weight
            nombres = [f"{loc_actual.iloc[d[2]]['localidad']} ({int(d[1])} capt, {d[0]:.0f}km)" for d in k_nearest]
        else:
            riesgo = 0
            nombres = []
        riesgo_vecinal.append(riesgo)
        vecinos_info.append('; '.join(nombres))

    loc_actual['riesgo_vecinal'] = riesgo_vecinal
    loc_actual['vecinos_detalle'] = vecinos_info
    loc_actual['tendencia'] = loc_actual['cantidad'] - loc_actual['cantidad_anterior']
    loc_actual['temporada'] = temp

    umbral_riesgo_val = loc_actual['riesgo_vecinal'].quantile(UMBRAL_RIESGO)
    umbral_capturas_bajo = loc_actual['cantidad'].quantile(0.3)

    def clasificar_alerta(row):
        if row['cantidad'] > umbral_capturas_bajo and row['riesgo_vecinal'] > umbral_riesgo_val:
            return 'BROTE + RIESGO ALTO'
        elif row['cantidad'] <= umbral_capturas_bajo and row['riesgo_vecinal'] > umbral_riesgo_val:
            return 'ALERTA: vecinos infectados'
        elif row['cantidad'] > umbral_capturas_bajo:
            return 'Brote activo'
        else:
            return 'Bajo riesgo'

    loc_actual['alerta'] = loc_actual.apply(clasificar_alerta, axis=1)
    risk_results[temp] = loc_actual

    print("\\nDistribución de alertas:")
    print(loc_actual['alerta'].value_counts().to_string())
    alertas = loc_actual[loc_actual['alerta'] == 'ALERTA: vecinos infectados'].sort_values('riesgo_vecinal', ascending=False)
    if len(alertas) > 0:
        print(f"\\nTOP 10 ALERTA (bajo nivel propio, alto riesgo vecinal):")
        cols_show = ['localidad', 'provincia', 'zona', 'cantidad', 'riesgo_vecinal', 'tendencia']
        print(alertas[cols_show].head(10).to_string(index=False))"""
        set_source(c, new_code)
        print(f"[OK] Cell {i} (risk calc) updated")
        break

# ---- CELL 17: Risk map (#VSC-143cfd7d) ----
for i, c in enumerate(nb['cells']):
    src = ''.join(c.get('source', []))
    if 'color_map' in src and 'BROTE + RIESGO ALTO' in src and 'fig_risk' in src and 'Evoluci' not in src:
        new_code = """# Mapa de riesgo de contagio — POR TEMPORADA
color_map = {
    'BROTE + RIESGO ALTO': 'red',
    'ALERTA: vecinos infectados': 'gold',
    'Brote activo': 'darkorange',
    'Bajo riesgo': 'green'
}

for temp, loc_actual in risk_results.items():
    fig_risk = px.scatter_map(
        loc_actual, lat='lat', lon='lon',
        color='alerta', size='riesgo_vecinal', size_max=30,
        hover_name='localidad',
        hover_data={'provincia': True, 'zona': True, 'cantidad': ':.0f',
                    'riesgo_vecinal': ':.1f', 'tendencia': ':.0f',
                    'lat': False, 'lon': False, 'alerta': False},
        color_discrete_map=color_map,
        category_orders={'alerta': ['BROTE + RIESGO ALTO', 'ALERTA: vecinos infectados', 'Brote activo', 'Bajo riesgo']},
        map_style='carto-positron', zoom=4, center=dict(lat=-32, lon=-62),
        title=f'Mapa de riesgo — Temporada {temp}', height=800
    )
    fig_risk.update_layout(legend_title='Nivel de alerta', margin=dict(l=0, r=0, t=40, b=0))
    fig_risk.show()"""
        set_source(c, new_code)
        print(f"[OK] Cell {i} (risk map) updated")
        break

# ---- CELL 18: Risk evolution (#VSC-9781a15b) ----
for i, c in enumerate(nb['cells']):
    src = ''.join(c.get('source', []))
    if 'all_risk_records' in src and 'fig_risk_anim' in src:
        new_code = """# Evolución del riesgo vecinal — POR TEMPORADA
for temp in sorted(df_all['temporada'].unique()):
    df_temp = df_all[df_all['temporada'] == temp]
    periodos_sorted = sorted(df_temp['fecha_inicio'].unique())
    
    all_risk_records = []
    for periodo_p in periodos_sorted:
        sub_p = df_temp[df_temp['fecha_inicio'] == periodo_p]
        loc_p = sub_p.groupby(['localidad', 'provincia', 'zona']).agg(
            lat=('lat', 'first'), lon=('lon', 'first'), cantidad=('cantidad', 'sum')
        ).reset_index()
        coords_p = loc_p[['lat', 'lon']].values
        cant_p = loc_p['cantidad'].values
        n_p = len(loc_p)
        for i in range(n_p):
            dists_i = []
            for j in range(n_p):
                if i == j: continue
                d = haversine(coords_p[i][0], coords_p[i][1], coords_p[j][0], coords_p[j][1])
                if 0 < d < DIST_MAX_KM:
                    dists_i.append((d, cant_p[j]))
            dists_i.sort(key=lambda x: x[0])
            k_near = dists_i[:K_NEIGHBORS]
            if k_near:
                w = [1.0/x[0] for x in k_near]
                tw = sum(w)
                riesgo_p = sum(wi * x[1] for wi, x in zip(w, k_near)) / tw
            else:
                riesgo_p = 0
            all_risk_records.append({
                'localidad': loc_p.iloc[i]['localidad'], 'provincia': loc_p.iloc[i]['provincia'],
                'zona': loc_p.iloc[i]['zona'], 'lat': loc_p.iloc[i]['lat'],
                'lon': loc_p.iloc[i]['lon'], 'cantidad': loc_p.iloc[i]['cantidad'],
                'riesgo_vecinal': riesgo_p,
                'periodo': pd.Timestamp(periodo_p).strftime('%d/%m/%Y')
            })

    df_risk_all = pd.DataFrame(all_risk_records)
    fechas_order = [pd.Timestamp(p).strftime('%d/%m/%Y') for p in periodos_sorted]

    risk_by_zona = df_risk_all.groupby(['periodo', 'zona']).agg(
        riesgo_medio=('riesgo_vecinal', 'mean'), capturas_media=('cantidad', 'mean')
    ).reset_index()
    risk_by_zona['periodo'] = pd.Categorical(risk_by_zona['periodo'], categories=fechas_order, ordered=True)
    risk_by_zona = risk_by_zona.sort_values('periodo')

    fig_evol = px.line(risk_by_zona, x='periodo', y='riesgo_medio', color='zona', markers=True,
        title=f'Riesgo vecinal promedio por zona — Temporada {temp}',
        labels={'periodo': 'Período', 'riesgo_medio': 'Riesgo vecinal (IDW)', 'zona': 'Zona'}, height=500)
    fig_evol.update_xaxes(tickangle=45)
    fig_evol.show()

    df_risk_all['periodo_cat'] = pd.Categorical(df_risk_all['periodo'], categories=fechas_order, ordered=True)
    df_risk_all['log_riesgo'] = np.log1p(df_risk_all['riesgo_vecinal'])

    fig_risk_anim = px.scatter_map(
        df_risk_all.sort_values('periodo_cat'),
        lat='lat', lon='lon', size='log_riesgo', color='riesgo_vecinal',
        animation_frame='periodo', hover_name='localidad',
        hover_data={'provincia': True, 'zona': True, 'cantidad': ':.0f', 'riesgo_vecinal': ':.1f'},
        color_continuous_scale='YlOrRd', size_max=20, zoom=4,
        center=dict(lat=-32, lon=-62), map_style='carto-positron',
        title=f'Evolución del riesgo — Temporada {temp}', height=800)
    fig_risk_anim.update_layout(coloraxis_colorbar_title='Riesgo vecinal', margin=dict(l=0, r=0, t=40, b=0))
    fig_risk_anim.show()"""
        set_source(c, new_code)
        print(f"[OK] Cell {i} (risk evolution) updated")
        break

# ---- Update markdown headers ----
for i, c in enumerate(nb['cells']):
    if c.get('cell_type') == 'markdown':
        src = ''.join(c.get('source', []))
        if 'scatter_mapbox' in src or ('Mapa animado con Plotly' in src and 'temporada' not in src.lower()):
            set_source(c, "## 3. Mapa animado con Plotly — por temporada\nCada temporada (Ago→Mar) tiene su propia animación independiente.")
            print(f"[OK] Markdown cell {i} (map header) updated")

# Save
with open(NB_PATH, 'w', encoding='utf-8') as f:
    json.dump(nb, f, ensure_ascii=False, indent=1)

print("\n[DONE] Notebook updated successfully!")
