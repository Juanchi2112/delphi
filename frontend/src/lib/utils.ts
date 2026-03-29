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
