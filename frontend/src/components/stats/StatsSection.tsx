"use client";

import ScrollReveal from "@/components/ui/ScrollReveal";
import { BentoItem } from "@/components/ui/cybernetic-bento-grid";
import RegionCard from "./RegionCard";
import RiskDistribution from "./RiskDistribution";
import type { ScoreItem } from "@/lib/types";
import { computeRegionStats } from "@/lib/utils";
import { useMapStore } from "@/stores/useMapStore";
import { useMemo } from "react";

const REGION_ORDER = ["NOA", "NEA", "CENTRO NORTE", "LITORAL", "CENTRO SUR", "URUGUAY"];

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

        {/* Row 1: Summary stats + Risk distribution */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <BentoItem className="md:col-span-2">
              <h3 className="text-lg font-bold text-stone-50 mb-4">Resumen de riesgo</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-stone-50 font-[family-name:var(--font-geist-mono)]">
                    {seasonItems.length}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">Localidades</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-400 font-[family-name:var(--font-geist-mono)]">
                    {totals.high}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">Riesgo crítico</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-amber-400 font-[family-name:var(--font-geist-mono)]">
                    {totals.medium}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">Riesgo moderado</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-400 font-[family-name:var(--font-geist-mono)]">
                    {totals.low}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">Riesgo bajo</p>
                </div>
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

        {/* Row 2: Region cards + Model info */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Region cards */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
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

            {/* Model info */}
            <BentoItem>
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Sobre el modelo
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-300">
                  <span>Algoritmo</span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-emerald-400">XGBoost</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Features</span>
                  <span className="font-[family-name:var(--font-geist-mono)]">28</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Validación</span>
                  <span className="font-[family-name:var(--font-geist-mono)]">Temporal</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Datos</span>
                  <span className="font-[family-name:var(--font-geist-mono)]">INTA + Open-Meteo</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Explicabilidad</span>
                  <span className="font-[family-name:var(--font-geist-mono)] text-emerald-400">SHAP</span>
                </div>
              </div>
            </BentoItem>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
