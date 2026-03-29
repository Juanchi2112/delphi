"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  GeoJSON,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useMapStore } from "@/stores/useMapStore";
import { RISK_CONFIG, ALERT_CONFIG, TREND_CONFIG, REGION_CENTERS, ARGENTINA_CENTER, ARGENTINA_ZOOM } from "@/lib/constants";
import { riskScoreToPercent } from "@/lib/utils";
import type { ScoreItem, MonitoringScoreItem } from "@/lib/types";

function MapController({ items }: { items: ScoreItem[] }) {
  const map = useMap();
  const { region, selectedId } = useMapStore();

  useEffect(() => {
    if (selectedId) {
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
  }, [region, selectedId, items, map]);

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
}: {
  items: ScoreItem[];
  monitoringItems?: MonitoringScoreItem[];
}) {
  const { mode, temporada, region, riskLevel, alertCategory } = useMapStore();

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
      {mode === "precampana"
        ? filteredPreSeason.map((item) => <RiskMarker key={item.id} item={item} />)
        : filteredMonitoring.map((item) => <MonitoringMarker key={item.id} item={item} />)}
    </MapContainer>
  );
}
