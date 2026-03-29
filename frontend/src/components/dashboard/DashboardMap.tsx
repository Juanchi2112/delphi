"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  GeoJSON,
  useMap,
} from "react-leaflet";
import * as turf from "@turf/turf";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

import { useMapStore } from "@/stores/useMapStore";
import { useCamposStore } from "@/stores/useCamposStore";
import {
  RISK_CONFIG,
  ALERT_CONFIG,
  TREND_CONFIG,
  REGION_CENTERS,
  ARGENTINA_CENTER,
  ARGENTINA_ZOOM,
} from "@/lib/constants";
import { riskScoreToPercent, findNearest, extractLocalidadKey } from "@/lib/utils";
import type { ScoreItem, MonitoringScoreItem } from "@/lib/types";

function MapController() {
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
    } else if (region && REGION_CENTERS[region]) {
      const { lat, lon, zoom } = REGION_CENTERS[region];
      map.flyTo([lat, lon], zoom, { duration: 1.2 });
    } else if (!selectedId) {
      map.flyTo(ARGENTINA_CENTER, ARGENTINA_ZOOM, { duration: 1.2 });
    }
  }, [region, selectedId, selectedCampoId, campos, map]);

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
      radius={isSelected ? config.radius + 3 : config.radius}
      pathOptions={{
        fillColor: config.color,
        fillOpacity: isFaded ? 0.15 : 0.6,
        color: isSelected ? config.color : "transparent",
        weight: isSelected ? 2 : 0,
        opacity: isFaded ? 0.15 : 1,
      }}
      eventHandlers={{ click: () => selectLocalidad(item.id) }}
    >
      <Tooltip
        direction="top"
        offset={[0, -8]}
        className="!bg-stone-900/95 !text-stone-50 !border-stone-700 !rounded-lg !px-3 !py-2 !text-xs"
      >
        <div className="text-center">
          <p className="font-semibold">{item.localidad}</p>
          <p className="text-stone-400">{item.provincia}</p>
          <p
            className="font-[family-name:var(--font-geist-mono)] mt-1"
            style={{ color: config.color }}
          >
            Riesgo: {riskScoreToPercent(item.risk_score)}%
          </p>
        </div>
      </Tooltip>
    </CircleMarker>
  );
}

interface Props {
  items: ScoreItem[];
  seasons: string[];
  monitoringItems?: MonitoringScoreItem[];
}

export default function DashboardMap({ items, monitoringItems = [] }: Props) {
  const { temporada, region, riskLevel } = useMapStore();
  const { campos, selectedCampoId } = useCamposStore();

  // Build monitoring lookup for campo polygon coloring
  const monitoringLookup = useMemo(() => {
    const map = new Map<string, MonitoringScoreItem>();
    for (const item of monitoringItems) {
      map.set(item.localidad_key, item);
    }
    return map;
  }, [monitoringItems]);

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
      scrollWheelZoom={true}
      attributionControl={true}
      minZoom={4}
      maxZoom={13}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <MapController />
      <DrawControl items={items} filtered={filtered} />

      {/* Saved campos — colored by monitoring alert if available */}
      {campos.map((campo) => {
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
      {filtered.map((item) => (
        <RiskMarker key={item.id} item={item} />
      ))}
    </MapContainer>
  );
}
