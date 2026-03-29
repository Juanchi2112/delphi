"use client";

import { motion } from "motion/react";
import { FEATURE_LABELS, FEATURE_UNITS, RISK_CONFIG } from "@/lib/constants";
import type { ShapFeature, RiskLevel } from "@/lib/types";

interface Props {
  features: ShapFeature[];
  baseValue: number;
  riskScore: number;
  riskLevel: RiskLevel;
}

function formatFeatureValue(name: string, value: number | null): string {
  if (value == null) return "";
  const unit = FEATURE_UNITS[name] ?? "";
  if (name === "wind_norte_ratio") return `${(value * 100).toFixed(0)}%`;
  if (unit === "°C") return `${value.toFixed(1)}${unit}`;
  if (unit === "km" && value > 100) return `${Math.round(value)} ${unit}`;
  if (unit === "km") return `${value.toFixed(0)} ${unit}`;
  if (unit === "mm") return `${Math.round(value)} ${unit}`;
  if (unit === "d") return `${Math.round(value)}`;
  if (unit === "GDD") return `${Math.round(value)}`;
  if (unit === "%") return `${value.toFixed(0)}%`;
  if (Number.isInteger(value)) return `${value}`;
  return `${value.toFixed(2)}`;
}

function formatDelta(delta: number): string {
  const pct = delta * 100;
  const sign = pct >= 0 ? "+" : "";
  if (Math.abs(pct) >= 1) return `${sign}${pct.toFixed(0)}%`;
  return `${sign}${pct.toFixed(1)}%`;
}

export default function ShapWaterfall({ features, baseValue, riskScore, riskLevel }: Props) {
  if (!features.length) return null;

  const maxAbsDelta = Math.max(...features.map((f) => Math.abs(f.shap_value)), 0.01);
  const riskConfig = RISK_CONFIG[riskLevel];

  return (
    <div className="space-y-3">
      <div>
        <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
          Por que este riesgo?
        </h4>
        <p className="text-[11px] text-stone-500 mt-1 leading-relaxed">
          Partiendo del promedio, cada factor{" "}
          <span className="text-red-400">sube</span> o{" "}
          <span className="text-emerald-400">baja</span> la probabilidad.
        </p>
      </div>

      {/* Base value */}
      <div className="flex items-center justify-between py-1.5 border-b border-stone-700/50">
        <span className="text-xs text-stone-500">Base (promedio)</span>
        <span className="text-xs font-[family-name:var(--font-geist-mono)] text-stone-400 bg-stone-800 px-2 py-0.5 rounded">
          {(baseValue * 100).toFixed(0)}%
        </span>
      </div>

      {/* Feature rows */}
      <div className="space-y-2">
        {features.map((f, i) => {
          const isPositive = f.shap_value >= 0;
          const barColor = isPositive ? "bg-red-500/80" : "bg-emerald-500/80";
          const textColor = isPositive ? "text-red-400" : "text-emerald-400";
          const barWidth = Math.max((Math.abs(f.shap_value) / maxAbsDelta) * 100, 2);
          const label =
            f.name === "_otros"
              ? "Otros factores"
              : FEATURE_LABELS[f.name] || f.name.replaceAll("_", " ");
          const rawValue =
            f.name === "_otros" ? "" : formatFeatureValue(f.name, f.value);

          return (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, x: isPositive ? 8 : -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 20,
                delay: 0.15 + i * 0.08,
              }}
              className="space-y-0.5"
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className="text-[11px] text-stone-300 truncate flex-1"
                  title={label}
                >
                  {label}
                </span>
                {rawValue && (
                  <span className="text-[10px] text-stone-500 font-[family-name:var(--font-geist-mono)] shrink-0">
                    {rawValue}
                  </span>
                )}
                <span
                  className={`text-[11px] font-semibold font-[family-name:var(--font-geist-mono)] shrink-0 ${textColor}`}
                >
                  {formatDelta(f.shap_value)}
                </span>
              </div>
              <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{
                    type: "spring",
                    stiffness: 80,
                    damping: 18,
                    delay: 0.2 + i * 0.08,
                  }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Final score */}
      <div className="flex items-center justify-between pt-1.5 border-t border-stone-700/50">
        <span className="text-xs font-semibold text-stone-300">
          Riesgo final
        </span>
        <motion.span
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 15,
            delay: 0.3 + features.length * 0.08,
          }}
          className="text-sm font-bold font-[family-name:var(--font-geist-mono)] px-2.5 py-0.5 rounded"
          style={{
            color: riskConfig.color,
            backgroundColor: riskConfig.glowColor,
          }}
        >
          {(riskScore * 100).toFixed(0)}%
        </motion.span>
      </div>
    </div>
  );
}
