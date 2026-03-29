"use client";

import { useMapStore } from "@/stores/useMapStore";
import { ALERT_CONFIG } from "@/lib/constants";
import type { AlertCategory, AlertsResponse } from "@/lib/types";

const CATEGORY_ORDER: AlertCategory[] = [
  "brote_riesgo_alto",
  "brote_activo",
  "alerta_vecinos",
  "bajo_riesgo",
];

export default function AlertsBanner({ alerts }: { alerts: AlertsResponse | null }) {
  const { alertCategory, setAlertCategory } = useMapStore();

  if (!alerts) return null;

  const countMap = new Map(alerts.alerts.map((a) => [a.category, a.count]));

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-stone-900/80 border-b border-stone-800">
      <span className="text-xs text-stone-500 mr-1">Alertas:</span>
      {CATEGORY_ORDER.map((cat) => {
        const count = countMap.get(cat) ?? 0;
        if (count === 0) return null;
        const cfg = ALERT_CONFIG[cat];
        const active = alertCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => setAlertCategory(active ? null : cat)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
            style={{
              backgroundColor: active ? `${cfg.color}20` : "#1C1917",
              color: active ? cfg.color : "#A8A29E",
              border: active ? `1px solid ${cfg.color}40` : "1px solid transparent",
            }}
          >
            <span
              className={`w-2 h-2 rounded-full ${cat === "brote_riesgo_alto" ? "animate-pulse" : ""}`}
              style={{ backgroundColor: cfg.color }}
            />
            {count} {cfg.label}
          </button>
        );
      })}
      <span className="text-xs text-stone-600 ml-auto">
        {alerts.total_localities} localidades
      </span>
    </div>
  );
}
