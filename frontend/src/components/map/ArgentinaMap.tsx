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
import { RISK_CONFIG, REGION_CENTERS, ARGENTINA_CENTER, ARGENTINA_ZOOM } from "@/lib/constants";
import { riskScoreToPercent } from "@/lib/utils";
import type { ScoreItem } from "@/lib/types";

function MapController({ items }: { items: ScoreItem[] }) {
  const map = useMap();
  const { region, selectedId } = useMapStore();

  useEffect(() => {
    if (selectedId) {
      const item = items.find((i) => i.id === selectedId);
      if (item) {
        // Offset lon to shift map left, leaving room for detail panel on right
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
      {/* Shadow layer */}
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
      {/* Border layer */}
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

export default function ArgentinaMap({ items }: { items: ScoreItem[] }) {
  const { temporada, region, riskLevel } = useMapStore();

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (item.temporada !== temporada) return false;
      if (region && item.region !== region) return false;
      if (riskLevel && item.risk_level !== riskLevel) return false;
      return true;
    });
  }, [items, temporada, region, riskLevel]);

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
      {filtered.map((item) => (
        <RiskMarker key={item.id} item={item} />
      ))}
    </MapContainer>
  );
}
