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
  "URUGUAY",
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
    <div className="flex flex-wrap items-center gap-3 p-4">
      {/* Season toggle */}
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

      {/* Separator */}
      <div className="w-px h-6 bg-stone-700" />

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

      {/* Risk level pills */}
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
              <span
                className="w-2 h-2 rounded-full"
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
