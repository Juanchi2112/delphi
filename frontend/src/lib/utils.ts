import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { RISK_CONFIG } from "./constants";
import type { RiskLevel, ScoreItem } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function riskColor(level: RiskLevel): string {
  return RISK_CONFIG[level].color;
}

export function riskLabel(level: RiskLevel): string {
  return RISK_CONFIG[level].label;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(0)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(0);
}

export function riskScoreToPercent(score: number): number {
  return Math.round(score * 100);
}

export function findNearest(items: ScoreItem[], lat: number, lon: number): ScoreItem {
  let best = items[0];
  let bestDist = Infinity;
  for (const item of items) {
    const d = (item.lat - lat) ** 2 + (item.lon - lon) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = item;
    }
  }
  return best;
}

/** Extract localidad_key from a pre-season localidad_id by stripping temporada + index. */
export function extractLocalidadKey(localidadId: string): string {
  // Pre-season ID: "achiras-c-rdoba-2025-2026-0063"
  // Monitoring key: "achiras-c-rdoba"
  // Strip last two dash-segments (temporada like "2025-2026" and 4-digit index)
  const parts = localidadId.split("-");
  // Find temporada pattern: YYYY-YYYY at positions [-3,-2] (e.g. "2025" "-" "2026")
  // The last segment is the index, the two before that are the temporada year halves
  if (parts.length >= 4) {
    return parts.slice(0, -3).join("-");
  }
  return localidadId;
}

export function computeRegionStats(items: ScoreItem[]) {
  const byRegion: Record<string, { total: number; low: number; medium: number; high: number; avgRisk: number }> = {};
  for (const item of items) {
    if (!byRegion[item.region]) {
      byRegion[item.region] = { total: 0, low: 0, medium: 0, high: 0, avgRisk: 0 };
    }
    const r = byRegion[item.region];
    r.total++;
    r[item.risk_level]++;
    r.avgRisk += item.risk_score;
  }
  for (const region of Object.values(byRegion)) {
    region.avgRisk = region.total > 0 ? region.avgRisk / region.total : 0;
  }
  return byRegion;
}
