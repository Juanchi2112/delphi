"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import * as turf from "@turf/turf";

import { useMapStore } from "@/stores/useMapStore";
import { useCamposStore } from "@/stores/useCamposStore";
import { RISK_CONFIG, ALERT_CONFIG, TREND_CONFIG, REGION_CENTERS, ARGENTINA_CENTER, ARGENTINA_ZOOM } from "@/lib/constants";
import { riskScoreToPercent, findNearest, extractLocalidadKey } from "@/lib/utils";
import type { ScoreItem, MonitoringScoreItem } from "@/lib/types";

function MapController({ items }: { items: ScoreItem[] }) {
  const map = useMap();
  const { region, selectedId } = useMapStore();
  const { selectedCampoId, campos } = useCamposStore();

  useEffect(() => {
    if (selectedCampoId) {
      const campo = campos.find((c) => c.id === selectedCampoId);
      if (campo) {
        const layer = L.geoJSON(campo.geojson);
        map.fitBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 13 });
      }
    } else if (selectedId) {
      const item = items.find((i) => i.id === selectedId);
      if (item) {
        map.flyTo([item.lat, item.lon + 1.5], 9, { duration: 1.2 });
      }
    } else if (region && REGION_CENTERS[region]) {
      const { lat, lon, zoom } = REGION_CENTERS[region];
      map.flyTo([lat, lon], zoom, { duration: 1.2 });
    } else {
      map.flyTo(ARGENTINA_CENTER, ARGENTINA_ZOOM, { duration: 1.2 });
    }
  }, [region, selectedId, selectedCampoId, campos, items, map]);

  return null;
}

function DrawControl({
  items,
  filtered,
}: {
  items: ScoreItem[];
  filtered: ScoreItem[];
}) {
  const map = useMap();
  const { setPendingCampo } = useCamposStore();
  const drawControlRef = useRef<L.Control.Draw | null>(null);
  const itemsForSearch = filtered.length > 0 ? filtered : items;

  useEffect(() => {
    if (drawControlRef.current) return;

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const control = new L.Control.Draw({
      position: "topright",
      draw: {
        polygon: {
          allowIntersection: false,
          shapeOptions: {
            color: "#10B981",
            fillColor: "#10B981",
            fillOpacity: 0.2,
            weight: 2,
          },
        },
        polyline: false,
        rectangle: false,
        circle: false,
        marker: false,
        circlemarker: false,
      },
      edit: {
        featureGroup: drawnItems,
        remove: false,
        edit: false,
      },
    });
    map.addControl(control);
    drawControlRef.current = control;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer as L.Polygon;
      const geojson = (layer.toGeoJSON() as GeoJSON.Feature<GeoJSON.Polygon>)
        .geometry;
      const areaM2 = turf.area(geojson);
      const hectareas = Math.round((areaM2 / 10000) * 100) / 100;
      const centroid = turf.centroid(geojson);
      const [cLon, cLat] = centroid.geometry.coordinates;
      const nearest = findNearest(itemsForSearch, cLat, cLon);
      setPendingCampo({ geojson, hectareas, nearest });
    });

    return () => {
      map.removeControl(control);
      map.removeLayer(drawnItems);
      drawControlRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  return null;
}

function RiskMarker({ item }: { item: ScoreItem }) {
  const { selectedId, selectLocalidad } = useMapStore();
  const config = RISK_CONFIG[item.risk_level];
  const isSelected = selectedId === item.id;
  const isFaded = selectedId !== null && !isSelected;

  return (
    <CircleMarker
      center={[item.lat, item.lon]}
      radius={isSelected ? config.radius + 2 : config.radius}
      pathOptions={{
        fillColor: config.color,
        fillOpacity: isFaded ? 0.15 : 0.85,
        color: isSelected ? config.color : "transparent",
        weight: isSelected ? 2 : 0,
        opacity: isFaded ? 0.15 : 1,
      }}
      eventHandlers={{
        click: () => selectLocalidad(item.id),
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, -8]}
        className="!bg-stone-900/95 !text-stone-50 !border-stone-700 !rounded-lg !px-3 !py-2 !text-xs"
      >
        <div className="text-center">
          <p className="font-semibold">{item.localidad}</p>
          <p className="text-stone-400">{item.provincia}</p>
          <p className="font-[family-name:var(--font-geist-mono)] mt-1" style={{ color: config.color }}>
            Riesgo: {riskScoreToPercent(item.risk_score)}%
          </p>
        </div>
      </Tooltip>
    </CircleMarker>
  );
}

function MonitoringMarker({ item }: { item: MonitoringScoreItem }) {
  const { selectedId, selectLocalidad } = useMapStore();
  const alertCfg = ALERT_CONFIG[item.alert_category];
  const trendCfg = TREND_CONFIG[item.trend];
  const isSelected = selectedId === item.localidad_key;
  const isFaded = selectedId !== null && !isSelected;
  const capturas = item.capturas_actual ?? 0;
  const radius = Math.max(3, Math.min(12, 3 + Math.log1p(capturas) * 1.5));

  return (
    <CircleMarker
      center={[item.lat, item.lon]}
      radius={isSelected ? radius + 3 : radius}
      pathOptions={{
        fillColor: alertCfg.color,
        fillOpacity: isFaded ? 0.15 : 0.85,
        color: isSelected ? alertCfg.color : "transparent",
        weight: isSelected ? 2 : 0,
        opacity: isFaded ? 0.15 : 1,
      }}
      eventHandlers={{
        click: () => selectLocalidad(item.localidad_key),
      }}
    >
      <Tooltip
        direction="top"
        offset={[0, -8]}
        className="!bg-stone-900/95 !text-stone-50 !border-stone-700 !rounded-lg !px-3 !py-2 !text-xs"
      >
        <div className="text-center">
          <p className="font-semibold">{item.localidad}</p>
          <p className="text-stone-400">{item.provincia}</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="font-[family-name:var(--font-geist-mono)]" style={{ color: alertCfg.color }}>
              {riskScoreToPercent(item.risk_score)}%
            </span>
            <span style={{ color: trendCfg.color }}>{trendCfg.arrow}</span>
          </div>
          {capturas > 0 && (
            <p className="text-stone-500 mt-0.5">{capturas} capturas</p>
          )}
        </div>
      </Tooltip>
    </CircleMarker>
  );
}

function ArgentinaBorder() {
  const [geoData, setGeoData] = useState<GeoJSON.FeatureCollection | null>(null);

  useEffect(() => {
    fetch("/southamerica.geojson")
      .then((res) => res.json())
      .then((data) => setGeoData(data))
      .catch(() => {});
  }, []);

  if (!geoData) return null;

  return (
    <>
      <GeoJSON
        key="shadow"
        data={geoData}
        interactive={false}
        style={{
          color: "rgba(255, 255, 255, 0.06)",
          weight: 5,
          fillColor: "transparent",
          fillOpacity: 0,
        }}
      />
      <GeoJSON
        key="border"
        data={geoData}
        interactive={false}
        style={{
          color: "rgba(255, 255, 255, 0.15)",
          weight: 1.5,
          fillColor: "transparent",
          fillOpacity: 0,
        }}
      />
    </>
  );
}

export default function ArgentinaMap({
  items,
  monitoringItems = [],
  enableDrawing = false,
}: {
  items: ScoreItem[];
  monitoringItems?: MonitoringScoreItem[];
  enableDrawing?: boolean;
}) {
  const { mode, temporada, region, riskLevel, alertCategory } = useMapStore();
  const { campos, selectedCampoId } = useCamposStore();

  const filteredPreSeason = useMemo(() => {
    return items.filter((item) => {
      if (item.temporada !== temporada) return false;
      if (region && item.region !== region) return false;
      if (riskLevel && item.risk_level !== riskLevel) return false;
      return true;
    });
  }, [items, temporada, region, riskLevel]);

  const filteredMonitoring = useMemo(() => {
    return monitoringItems.filter((item) => {
      if (region && item.region !== region) return false;
      if (alertCategory && item.alert_category !== alertCategory) return false;
      return true;
    });
  }, [monitoringItems, region, alertCategory]);

  const monitoringLookup = useMemo(() => {
    const map = new Map<string, MonitoringScoreItem>();
    for (const item of monitoringItems) {
      map.set(item.localidad_key, item);
    }
    return map;
  }, [monitoringItems]);

  return (
    <MapContainer
      center={ARGENTINA_CENTER}
      zoom={ARGENTINA_ZOOM}
      className="h-full w-full"
      zoomControl={true}
      scrollWheelZoom={false}
      attributionControl={false}
      minZoom={4}
      maxZoom={13}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <ArgentinaBorder />
      <MapController items={items} />

      {/* Drawing controls — only when authenticated */}
      {enableDrawing && (
        <DrawControl items={items} filtered={filteredPreSeason} />
      )}

      {/* User's saved campos as polygons */}
      {enableDrawing &&
        campos.map((campo) => {
          const monItem = campo.localidad_id
            ? monitoringLookup.get(extractLocalidadKey(campo.localidad_id))
            : undefined;
          const borderColor = monItem
            ? ALERT_CONFIG[monItem.alert_category].color
            : "#10B981";
          return (
            <GeoJSON
              key={campo.id}
              data={campo.geojson}
              style={{
                color: borderColor,
                fillColor: borderColor,
                fillOpacity: selectedCampoId === campo.id ? 0.3 : 0.1,
                weight: selectedCampoId === campo.id ? 3 : 1.5,
              }}
            />
          );
        })}

      {/* Risk markers */}
      {mode === "precampana"
        ? filteredPreSeason.map((item) => <RiskMarker key={item.id} item={item} />)
        : filteredMonitoring.map((item) => <MonitoringMarker key={item.id} item={item} />)}
    </MapContainer>
  );
}
