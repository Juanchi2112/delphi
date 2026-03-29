"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { useSpring } from "motion/react";
import { useMapStore } from "@/stores/useMapStore";
import {
  RISK_CONFIG,
  REGION_CENTERS,
  MAP_VIEWBOX_WIDTH,
  MAP_VIEWBOX_HEIGHT,
  REGION_ZOOM_SCALE,
} from "@/lib/constants";
import { riskScoreToPercent } from "@/lib/utils";
import type { ScoreItem } from "@/lib/types";
import topologyData from "@/data/argentina-provinces.topo.json";

// ── Static geometry (computed once at module load) ──────────────────────

const topology = topologyData as unknown as Topology;
const objectKey = Object.keys(topology.objects)[0];
const argentinaFeatures = feature(
  topology,
  topology.objects[objectKey] as GeometryCollection
);

const PAD = 40;
const projection = geoMercator().fitExtent(
  [
    [PAD, PAD],
    [MAP_VIEWBOX_WIDTH - PAD, MAP_VIEWBOX_HEIGHT - PAD],
  ],
  argentinaFeatures
);
const pathGenerator = geoPath(projection);

// Pre-compute province paths + label positions (visual centroid of projected path)
const provinceData = argentinaFeatures.features.map((feat) => {
  const d = pathGenerator(feat) ?? "";
  const centroid = pathGenerator.centroid(feat);
  const name = (feat.properties as { name?: string })?.name ?? "";
  return { d, labelX: centroid[0], labelY: centroid[1], name };
});

// Pre-compute province paths as a single combined path string for faster rendering
const provincePaths = provinceData.map((p) => p.d);

// ── Projection cache ────────────────────────────────────────────────────

const projectionCache = new Map<string, [number, number]>();

function projectCached(lon: number, lat: number): [number, number] | null {
  const key = `${lon},${lat}`;
  const cached = projectionCache.get(key);
  if (cached) return cached;
  const result = projection([lon, lat]);
  if (!result) return null;
  const tuple: [number, number] = [result[0], result[1]];
  projectionCache.set(key, tuple);
  return tuple;
}

// ── Types & constants ───────────────────────────────────────────────────

interface TooltipState {
  item: ScoreItem;
  x: number;
  y: number;
}

const SELECTION_ZOOM = 2.5;

interface ViewBoxState {
  x: number;
  y: number;
  w: number;
  h: number;
}

function computeViewBox(
  targetX: number,
  targetY: number,
  scale: number,
  containerWidth: number,
  containerHeight: number,
  panelPx: number = 0
): ViewBoxState {
  const containerAspect = containerWidth / containerHeight;
  const h = MAP_VIEWBOX_HEIGHT / scale;
  const w = h * containerAspect;
  const pxToVB = w / containerWidth;
  const panelVB = panelPx * pxToVB;
  const x = targetX - (w - panelVB) / 2;
  const y = targetY - h / 2;
  return { x, y, w, h };
}

// ── useViewBox hook ─────────────────────────────────────────────────────

function useViewBox(
  region: string | null,
  selectedId: string | null,
  items: ScoreItem[],
  containerRef: React.RefObject<HTMLDivElement | null>
): ViewBoxState {
  const [containerSize, setContainerSize] = useState({ w: 1200, h: 800 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () =>
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [containerRef]);

  return useMemo(() => {
    if (selectedId) {
      const item = items.find((i) => i.id === selectedId);
      if (item) {
        const projected = projectCached(item.lon, item.lat);
        if (projected) {
          return computeViewBox(
            projected[0],
            projected[1],
            SELECTION_ZOOM,
            containerSize.w,
            containerSize.h,
            360
          );
        }
      }
    }

    if (region && REGION_CENTERS[region]) {
      const center = REGION_CENTERS[region];
      const projected = projectCached(center.lon, center.lat);
      if (projected) {
        const scale = REGION_ZOOM_SCALE[region] ?? 2.5;
        return computeViewBox(
          projected[0],
          projected[1],
          scale,
          containerSize.w,
          containerSize.h,
          0
        );
      }
    }

    const containerAspect = containerSize.w / containerSize.h;
    const defaultH = MAP_VIEWBOX_HEIGHT;
    const defaultW = defaultH * containerAspect;
    return {
      x: MAP_VIEWBOX_WIDTH / 2 - defaultW / 2,
      y: 0,
      w: defaultW,
      h: defaultH,
    };
  }, [region, selectedId, items, containerSize]);
}

// ── Main component ──────────────────────────────────────────────────────

export default function ArgentinaMap({ items }: { items: ScoreItem[] }) {
  const temporada = useMapStore((s) => s.temporada);
  const region = useMapStore((s) => s.region);
  const riskLevel = useMapStore((s) => s.riskLevel);
  const selectedId = useMapStore((s) => s.selectedId);
  const selectLocalidad = useMapStore((s) => s.selectLocalidad);

  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const dotsGroupRef = useRef<SVGGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  // Filter items
  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (item.temporada !== temporada) return false;
      if (riskLevel && item.risk_level !== riskLevel) return false;
      return true;
    });
  }, [items, temporada, riskLevel]);

  // Pre-project all dot positions with cache
  const projectedDots = useMemo(() => {
    const result: { item: ScoreItem; cx: number; cy: number }[] = [];
    for (const item of filtered) {
      const proj = projectCached(item.lon, item.lat);
      if (proj) result.push({ item, cx: proj[0], cy: proj[1] });
    }
    return result;
  }, [filtered]);

  const targetVB = useViewBox(region, selectedId, items, containerRef);
  const currentScale = targetVB.w > 0 ? MAP_VIEWBOX_WIDTH / targetVB.w : 1;

  // Animate viewBox with springs — update DOM directly, zero re-renders
  const springConfig = { stiffness: 70, damping: 20 };
  const vbX = useSpring(targetVB.x, springConfig);
  const vbY = useSpring(targetVB.y, springConfig);
  const vbW = useSpring(targetVB.w, springConfig);
  const vbH = useSpring(targetVB.h, springConfig);

  useEffect(() => {
    vbX.set(targetVB.x);
    vbY.set(targetVB.y);
    vbW.set(targetVB.w);
    vbH.set(targetVB.h);
  }, [targetVB, vbX, vbY, vbW, vbH]);

  useEffect(() => {
    const sync = () => {
      const svg = svgRef.current;
      if (svg) {
        svg.setAttribute(
          "viewBox",
          `${vbX.get()} ${vbY.get()} ${vbW.get()} ${vbH.get()}`
        );
      }
    };
    const unsubs = [
      vbX.on("change", sync),
      vbY.on("change", sync),
      vbW.on("change", sync),
      vbH.on("change", sync),
    ];
    sync();
    return () => unsubs.forEach((u) => u());
  }, [vbX, vbY, vbW, vbH]);

  // Update dots via DOM manipulation — avoids React re-render cascade
  useEffect(() => {
    const g = dotsGroupRef.current;
    if (!g) return;

    const invScale = 1 / currentScale;

    // Update all circles in the dots group via DOM
    const circles = g.querySelectorAll<SVGCircleElement>("circle[data-dot-id]");
    circles.forEach((circle) => {
      const id = circle.getAttribute("data-dot-id");
      const baseR = parseFloat(circle.getAttribute("data-base-r") || "4");
      const isSelected = id === selectedId;
      const isFaded = selectedId !== null && !isSelected;

      circle.setAttribute("r", String(baseR * invScale));
      circle.setAttribute("opacity", isFaded ? "0.15" : "0.9");

      // Show/hide selection ring
      const ring = circle.nextElementSibling as SVGCircleElement | null;
      if (ring?.classList.contains("selection-ring")) {
        ring.setAttribute("r", String((baseR + 4) * invScale));
        ring.setAttribute("stroke-width", String(1.5 * invScale));
        ring.style.display = isSelected ? "" : "none";
      }
    });

    // Update glow rings
    const glowRings = g.querySelectorAll<SVGCircleElement>(".glow-ring");
    glowRings.forEach((ring) => {
      const baseR = parseFloat(ring.getAttribute("data-base-r") || "6");
      ring.setAttribute("r", String((baseR + 3) * invScale));
      ring.setAttribute("stroke-width", String(0.5 * invScale));
    });
  }, [currentScale, selectedId]);

  // Clear tooltip when filters change
  useEffect(() => {
    setTooltip(null);
  }, [temporada, region, riskLevel]);

  const handleDotClick = useCallback(
    (e: React.MouseEvent<SVGGElement>) => {
      const circle = (e.target as Element).closest<SVGCircleElement>(
        "circle[data-dot-id]"
      );
      if (circle) {
        selectLocalidad(circle.getAttribute("data-dot-id"));
      }
    },
    [selectLocalidad]
  );

  const handleDotHover = useCallback(
    (e: React.MouseEvent<SVGGElement>) => {
      const circle = (e.target as Element).closest<SVGCircleElement>(
        "circle[data-dot-id]"
      );
      if (!circle || !containerRef.current) return;

      const id = circle.getAttribute("data-dot-id");
      const item = filtered.find((i) => i.id === id);
      if (!item) return;

      const circleRect = circle.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();
      setTooltip({
        item,
        x: circleRect.left + circleRect.width / 2 - containerRect.left,
        y: circleRect.top - containerRect.top,
      });
    },
    [filtered]
  );

  const handleDotLeave = useCallback(() => setTooltip(null), []);

  const strokeWidth = 0.5 / currentScale;
  const labelFontSize = 8 / currentScale;

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden">
      <svg
        ref={svgRef}
        viewBox={`${targetVB.x} ${targetVB.y} ${targetVB.w} ${targetVB.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        <defs>
          <pattern
            id="map-grid"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="#1c1917"
              strokeWidth="0.3"
            />
          </pattern>
          <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#0c0a09" stopOpacity="0.6" />
          </radialGradient>
        </defs>

        {/* Background + grid */}
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="#0c0a09" />
        <rect x={-2000} y={-2000} width={5000} height={5000} fill="url(#map-grid)" />

        {/* Province paths — static, no CSS transitions */}
        {provincePaths.map((d, i) => (
          <path
            key={i}
            d={d}
            fill="#1c1917"
            stroke="#44403c"
            strokeWidth={strokeWidth}
          />
        ))}

        {/* Province labels */}
        {provinceData.map((p, i) =>
          p.name ? (
            <text
              key={i}
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#78716c"
              fontSize={labelFontSize}
              fontWeight={500}
              pointerEvents="none"
              style={{ userSelect: "none" }}
            >
              {p.name}
            </text>
          ) : null
        )}

        {/* Risk dots — plain SVG with CSS animations, event delegation */}
        <g
          ref={dotsGroupRef}
          onClick={handleDotClick}
          onMouseOver={handleDotHover}
          onMouseOut={handleDotLeave}
          style={{ cursor: "pointer" }}
        >
          {projectedDots.map(({ item, cx, cy }) => {
            const config = RISK_CONFIG[item.risk_level];
            const r = config.radius / currentScale;
            const isSelected = selectedId === item.id;
            const isFaded = selectedId !== null && !isSelected;

            return (
              <g key={item.id}>
                {/* Main dot */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={r}
                  fill={config.color}
                  opacity={isFaded ? 0.15 : 0.9}
                  data-dot-id={item.id}
                  data-base-r={config.radius}
                />

                {/* Selection ring */}
                <circle
                  className="selection-ring"
                  cx={cx}
                  cy={cy}
                  r={(config.radius + 4) / currentScale}
                  fill="none"
                  stroke={config.color}
                  strokeWidth={1.5 / currentScale}
                  style={{ display: isSelected ? "" : "none" }}
                />
              </g>
            );
          })}
        </g>

        {/* Vignette */}
        <rect
          x={-2000}
          y={-2000}
          width={5000}
          height={5000}
          fill="url(#vignette)"
          pointerEvents="none"
        />
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-50 bg-stone-900/95 text-stone-50 border border-stone-700 rounded-lg px-3 py-2 text-xs backdrop-blur-sm animate-in fade-in slide-in-from-bottom-1 duration-150"
          style={{
            left: tooltip.x,
            top: tooltip.y - 48,
            transform: "translateX(-50%)",
          }}
        >
          <p className="font-semibold">{tooltip.item.localidad}</p>
          <p className="text-stone-400">{tooltip.item.provincia}</p>
          <p
            className="font-[family-name:var(--font-geist-mono)] mt-1"
            style={{ color: RISK_CONFIG[tooltip.item.risk_level].color }}
          >
            Riesgo: {riskScoreToPercent(tooltip.item.risk_score)}%
          </p>
        </div>
      )}
    </div>
  );
}
