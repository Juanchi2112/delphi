"use client";

import { useMapStore } from "@/stores/useMapStore";
import { RISK_CONFIG, ALERT_CONFIG } from "@/lib/constants";
import type { RiskLevel, AlertCategory } from "@/lib/types";

const REGIONS = [
  "NOA",
  "NEA",
  "CENTRO NORTE",
  "LITORAL",
  "CENTRO SUR",
];

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high"];
const ALERT_CATEGORIES: AlertCategory[] = [
  "brote_riesgo_alto",
  "brote_activo",
  "alerta_vecinos",
  "bajo_riesgo",
];

export default function MapFilters({
  seasons,
}: {
  seasons: string[];
}) {
  const {
    mode, temporada, region, riskLevel, alertCategory,
    setMode, setTemporada, setRegion, setRiskLevel, setAlertCategory,
  } = useMapStore();

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-stone-900/80 rounded-md p-1">
        <button
          onClick={() => setMode("precampana")}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
            mode === "precampana"
              ? "bg-stone-50 text-stone-950"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          Pre-campana
        </button>
        <button
          onClick={() => setMode("monitoreo")}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
            mode === "monitoreo"
              ? "bg-amber-500 text-stone-950"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          Monitoreo
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-stone-700/50" />

      {/* Season toggle (pre-season only) */}
      {mode === "precampana" && (
        <>
          <div className="flex items-center gap-1 bg-stone-900/80 rounded-md p-1">
            {seasons.map((s) => (
              <button
                key={s}
                onClick={() => setTemporada(s)}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all cursor-pointer ${
                  temporada === s
                    ? "bg-stone-50 text-stone-950"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-stone-700/50" />
        </>
      )}

      {/* Region pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setRegion(null)}
          className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer border ${
            region === null
              ? "bg-stone-50 text-stone-950 border-stone-50"
              : "bg-stone-900/60 text-stone-400 border-stone-700/50 hover:text-stone-200 hover:border-stone-600"
          }`}
        >
          Todas
        </button>
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(region === r ? null : r)}
            className={`px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer border ${
              region === r
                ? "bg-stone-50 text-stone-950 border-stone-50"
                : "bg-stone-900/60 text-stone-400 border-stone-700/50 hover:text-stone-200 hover:border-stone-600"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-stone-700/50" />

      {/* Risk level pills (pre-season) or Alert category pills (monitoring) */}
      {mode === "precampana" ? (
        <div className="flex gap-1.5">
          {RISK_LEVELS.map((l) => {
            const cfg = RISK_CONFIG[l];
            const active = riskLevel === l;
            return (
              <button
                key={l}
                onClick={() => setRiskLevel(active ? null : l)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors cursor-pointer border ${
                  active
                    ? "bg-stone-50 text-stone-950 border-stone-50"
                    : "bg-stone-900/60 text-stone-400 border-stone-700/50 hover:text-stone-200 hover:border-stone-600"
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {ALERT_CATEGORIES.map((cat) => {
            const cfg = ALERT_CONFIG[cat];
            const active = alertCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setAlertCategory(active ? null : cat)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: active ? `${cfg.color}20` : "rgba(12,10,9,0.6)",
                  color: active ? cfg.color : "#A8A29E",
                  border: active ? `1px solid ${cfg.color}40` : "1px solid rgba(68,64,60,0.5)",
                }}
              >
                <span
                  className={`w-2 h-2 rounded-full ${cat === "brote_riesgo_alto" ? "animate-pulse" : ""}`}
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
