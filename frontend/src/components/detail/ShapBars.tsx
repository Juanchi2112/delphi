"use client";

import { motion } from "motion/react";
import { FEATURE_LABELS } from "@/lib/constants";
import type { FeatureValue } from "@/lib/types";

export default function ShapBars({ features }: { features: FeatureValue[] }) {
  if (!features.length) return null;

  const maxVal = Math.max(...features.map((f) => Math.abs(f.value ?? 0)), 1);

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
        Factores clave
      </h4>
      {features.map((f, i) => {
        const width = Math.min(((Math.abs(f.value ?? 0)) / maxVal) * 100, 100);
        const label = FEATURE_LABELS[f.name] || f.name.replaceAll("_", " ");
        return (
          <div key={f.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-stone-300">{label}</span>
              <span className="text-stone-500 font-[family-name:var(--font-geist-mono)]">
                {f.value?.toFixed(1)}
              </span>
            </div>
            <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-500"
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                transition={{ type: "spring", stiffness: 80, damping: 18, delay: i * 0.1 }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
