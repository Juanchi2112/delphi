"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMapStore } from "@/stores/useMapStore";
import { RISK_CONFIG, ALERT_CONFIG, TREND_CONFIG, REGION_CENTERS, ARGENTINA_CENTER, ARGENTINA_ZOOM } from "@/lib/constants";
import { riskScoreToPercent } from "@/lib/utils";
import type { ScoreItem, MonitoringScoreItem } from "@/lib/types";

function MapController() {
  const map = useMap();
  const { region, selectedId } = useMapStore();

  useEffect(() => {
    if (region && REGION_CENTERS[region]) {
      const { lat, lon, zoom } = REGION_CENTERS[region];
      map.flyTo([lat, lon], zoom, { duration: 1.2 });
    } else if (!selectedId) {
      map.flyTo(ARGENTINA_CENTER, ARGENTINA_ZOOM, { duration: 1.2 });
    }
  }, [region, selectedId, map]);

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
      radius={isSelected ? config.radius + 3 : config.radius}
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

export default function ArgentinaMap({
  items,
  monitoringItems = [],
}: {
  items: ScoreItem[];
  monitoringItems?: MonitoringScoreItem[];
}) {
  const { mode, temporada, region, riskLevel, alertCategory } = useMapStore();
  const mapRef = useRef(null);

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

  return (
    <MapContainer
      center={ARGENTINA_CENTER}
      zoom={ARGENTINA_ZOOM}
      ref={mapRef}
      className="h-full w-full"
      zoomControl={true}
      scrollWheelZoom={false}
      attributionControl={true}
      minZoom={4}
      maxZoom={13}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapController />
      {mode === "precampana"
        ? filteredPreSeason.map((item) => <RiskMarker key={item.id} item={item} />)
        : filteredMonitoring.map((item) => <MonitoringMarker key={item.id} item={item} />)}
    </MapContainer>
  );
}
