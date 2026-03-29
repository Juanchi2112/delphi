"use client";

import { ALERT_CONFIG } from "@/lib/constants";
import type { AlertCategory } from "@/lib/types";

export default function AlertCategoryBadge({ category }: { category: AlertCategory }) {
  const cfg = ALERT_CONFIG[category];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: `${cfg.color}20`,
        color: cfg.color,
        border: `1px solid ${cfg.color}40`,
      }}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${category === "brote_riesgo_alto" ? "animate-pulse" : ""}`}
        style={{ backgroundColor: cfg.color }}
      />
      {cfg.label}
    </span>
  );
}
