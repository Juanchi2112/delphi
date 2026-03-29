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
  "URUGUAY",
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
    <div className="flex flex-wrap items-center gap-3 p-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-stone-800/80 rounded-lg p-1">
        <button
          onClick={() => setMode("precampana")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            mode === "precampana"
              ? "bg-emerald-500 text-stone-950"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          Pre-campana
        </button>
        <button
          onClick={() => setMode("monitoreo")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
            mode === "monitoreo"
              ? "bg-amber-500 text-stone-950"
              : "text-stone-400 hover:text-stone-200"
          }`}
        >
          Monitoreo
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-stone-700" />

      {/* Season toggle (pre-season only) */}
      {mode === "precampana" && (
        <>
          <div className="flex items-center gap-1 bg-stone-800/80 rounded-lg p-1">
            {seasons.map((s) => (
              <button
                key={s}
                onClick={() => setTemporada(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  temporada === s
                    ? "bg-emerald-500 text-stone-950"
                    : "text-stone-400 hover:text-stone-200"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="w-px h-6 bg-stone-700" />
        </>
      )}

      {/* Region pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setRegion(null)}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
            region === null
              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
              : "bg-stone-800 text-stone-400 hover:text-stone-200"
          }`}
        >
          Todas
        </button>
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(region === r ? null : r)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              region === r
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "bg-stone-800 text-stone-400 hover:text-stone-200"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-6 bg-stone-700" />

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
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer"
                style={{
                  backgroundColor: active ? `${cfg.color}20` : "#292524",
                  color: active ? cfg.color : "#A8A29E",
                  border: active ? `1px solid ${cfg.color}40` : "1px solid transparent",
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
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
                  backgroundColor: active ? `${cfg.color}20` : "#292524",
                  color: active ? cfg.color : "#A8A29E",
                  border: active ? `1px solid ${cfg.color}40` : "1px solid transparent",
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
