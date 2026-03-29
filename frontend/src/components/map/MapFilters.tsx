"use client";

import { useMapStore } from "@/stores/useMapStore";
import { RISK_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/lib/types";

const REGIONS = [
  "NOA",
  "NEA",
  "CENTRO NORTE",
  "LITORAL",
  "CENTRO SUR",
];

const RISK_LEVELS: RiskLevel[] = ["low", "medium", "high"];

export default function MapFilters({
  seasons,
}: {
  seasons: string[];
}) {
  const { temporada, region, riskLevel, setTemporada, setRegion, setRiskLevel } =
    useMapStore();

  return (
    <div className="flex flex-wrap items-center gap-4 px-5 py-3">
      {/* Season toggle */}
      <div className="flex items-center gap-0.5 rounded-xl bg-stone-900/80 border border-stone-700/40 p-1 backdrop-blur-sm">
        {seasons.map((s) => (
          <button
            key={s}
            onClick={() => setTemporada(s)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
              temporada === s
                ? "bg-stone-100 text-stone-900 shadow-sm"
                : "text-stone-500 hover:text-stone-300 hover:bg-stone-800/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-stone-700/60" />

      {/* Region pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setRegion(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
            region === null
              ? "bg-stone-100 text-stone-900 border-stone-300 shadow-sm"
              : "bg-transparent text-stone-500 border-stone-700/40 hover:text-stone-300 hover:border-stone-600/60 hover:bg-stone-800/40"
          }`}
        >
          Todas
        </button>
        {REGIONS.map((r) => (
          <button
            key={r}
            onClick={() => setRegion(region === r ? null : r)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
              region === r
                ? "bg-stone-100 text-stone-900 border-stone-300 shadow-sm"
                : "bg-transparent text-stone-500 border-stone-700/40 hover:text-stone-300 hover:border-stone-600/60 hover:bg-stone-800/40"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-5 bg-stone-700/60" />

      {/* Risk level pills */}
      <div className="flex gap-1.5">
        {RISK_LEVELS.map((l) => {
          const cfg = RISK_CONFIG[l];
          const active = riskLevel === l;
          return (
            <button
              key={l}
              onClick={() => setRiskLevel(active ? null : l)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer border ${
                active
                  ? "border-stone-600/60 bg-stone-800/80 shadow-sm"
                  : "border-transparent bg-transparent text-stone-500 hover:text-stone-300 hover:bg-stone-800/40"
              }`}
              style={{
                color: active ? cfg.color : undefined,
              }}
            >
              <span
                className="w-2 h-2 rounded-full ring-2 ring-offset-1 ring-offset-stone-900"
                style={{
                  backgroundColor: cfg.color,
                  ringColor: `${cfg.color}40`,
                }}
              />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
