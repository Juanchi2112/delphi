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
    <div className="flex flex-wrap items-center gap-3 px-4 py-3">
      {/* Season toggle */}
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

      {/* Separator */}
      <div className="w-px h-6 bg-stone-700/50" />

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

      {/* Risk level pills */}
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
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cfg.color }}
              />
              {cfg.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
