"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { BentoItem } from "@/components/ui/cybernetic-bento-grid";
import RegionCard from "./RegionCard";
import RiskDistribution from "./RiskDistribution";
import type { ScoreItem } from "@/lib/types";
import { computeRegionStats } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { useMemo } from "react";
import { RISK_CONFIG } from "@/lib/constants";

const REGION_ORDER = ["NOA", "NEA", "CENTRO NORTE", "LITORAL", "CENTRO SUR"];

export default function StatsSection({ items }: { items: ScoreItem[] }) {
  const temporada = useMapStore((s) => s.temporada);

  const seasonItems = useMemo(
    () => items.filter((i) => i.temporada === temporada),
    [items, temporada]
  );

  const regionStats = useMemo(() => computeRegionStats(seasonItems), [seasonItems]);

  const totals = useMemo(() => {
    let low = 0, medium = 0, high = 0;
    for (const item of seasonItems) {
      if (item.risk_level === "low") low++;
      else if (item.risk_level === "medium") medium++;
      else high++;
    }
    return { low, medium, high };
  }, [seasonItems]);

  const activeRegions = REGION_ORDER.filter((r) => regionStats[r]);

  const statItems = [
    { label: "Localidades", value: seasonItems.length },
    { label: "Crítico", value: totals.high, dot: RISK_CONFIG.high.color },
    { label: "Moderado", value: totals.medium, dot: RISK_CONFIG.medium.color },
    { label: "Bajo", value: totals.low, dot: RISK_CONFIG.low.color },
  ];

  return (
    <section id="datos" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-50 mb-2 text-center font-[family-name:var(--font-space-grotesk)]">
            Panorama Nacional
          </h2>
          <p className="text-stone-400 mb-8 text-center">
            Análisis de riesgo por región — Temporada {temporada}
          </p>
        </ScrollReveal>

        {/* Row 1: Summary + Distribution */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <BentoItem className="md:col-span-2">
              <h3 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-6">
                Resumen de riesgo
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statItems.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-3xl font-bold text-stone-50 font-[family-name:var(--font-geist-mono)]">
                      {s.value}
                    </p>
                    <p className="text-xs text-stone-500 mt-1.5 flex items-center justify-center gap-1.5">
                      {s.dot && (
                        <span
                          className="w-1.5 h-1.5 rounded-full inline-block"
                          style={{ backgroundColor: s.dot }}
                        />
                      )}
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </BentoItem>

            <BentoItem>
              <RiskDistribution
                low={totals.low}
                medium={totals.medium}
                high={totals.high}
              />
            </BentoItem>
          </div>
        </ScrollReveal>

        {/* Row 2: Region cards — full width */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeRegions.map((r) => (
              <BentoItem key={r}>
                <RegionCard
                  name={r}
                  total={regionStats[r].total}
                  low={regionStats[r].low}
                  medium={regionStats[r].medium}
                  high={regionStats[r].high}
                  avgRisk={regionStats[r].avgRisk}
                />
              </BentoItem>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
