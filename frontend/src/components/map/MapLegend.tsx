"use client";

import { useMapStore } from "@/stores/useMapStore";
import { RISK_CONFIG, ALERT_CONFIG } from "@/lib/constants";
import type { AlertCategory } from "@/lib/types";

const ALERT_ORDER: AlertCategory[] = [
  "brote_riesgo_alto",
  "brote_activo",
  "alerta_vecinos",
  "bajo_riesgo",
];

export default function MapLegend() {
  const mode = useMapStore((s) => s.mode);

  return (
    <div data-onboarding="map-legend" className="absolute bottom-6 left-4 z-[1000] glass-subtle rounded-lg px-3 py-2 flex items-center gap-4">
      {mode === "precampana"
        ? (["low", "medium", "high"] as const).map((level) => {
            const cfg = RISK_CONFIG[level];
            return (
              <div key={level} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-xs text-stone-400">{cfg.label}</span>
              </div>
            );
          })
        : ALERT_ORDER.map((cat) => {
            const cfg = ALERT_CONFIG[cat];
            return (
              <div key={cat} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="text-xs text-stone-400">{cfg.label}</span>
              </div>
            );
          })}
    </div>
  );
}
