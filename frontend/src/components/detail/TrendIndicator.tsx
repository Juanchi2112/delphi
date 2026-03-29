"use client";

import { TREND_CONFIG } from "@/lib/constants";
import type { TrendDirection } from "@/lib/types";

export default function TrendIndicator({
  trend,
  delta,
  showDelta = true,
}: {
  trend: TrendDirection;
  delta?: number;
  showDelta?: boolean;
}) {
  const cfg = TREND_CONFIG[trend];
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: cfg.color }}>
      <span className="text-sm">{cfg.arrow}</span>
      {showDelta && delta != null && Math.abs(delta) > 0.001 && (
        <span className="font-[family-name:var(--font-geist-mono)]">
          {delta > 0 ? "+" : ""}
          {(delta * 100).toFixed(1)}%
        </span>
      )}
      {!showDelta && <span>{cfg.label}</span>}
    </span>
  );
}
