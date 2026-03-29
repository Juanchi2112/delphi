"use client";

import { DollarSign, TrendingUp, Timer } from "lucide-react";
import { BentoItem } from "@/components/ui/cybernetic-bento-grid";
import ScrollReveal from "@/components/ui/ScrollReveal";

const STATS = [
  {
    number: "USD 680K",
    subtitle: "en riesgo por campaña",
    detail:
      "Pérdida potencial para un productor de 1.000 ha si la chicharrita ataca sin aviso previo.",
    icon: DollarSign,
  },
  {
    number: "14x",
    subtitle: "retorno de inversión",
    detail:
      "El costo de Delphi es menos del 0.1% del valor de una campaña maicera de 1.000 ha.",
    icon: TrendingUp,
  },
  {
    number: "15 días",
    subtitle: "de ventaja",
    detail:
      "Cada quincena de anticipación puede salvar entre 20% y 40% del rendimiento.",
    icon: Timer,
  },
];

export default function ImpactSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
            El costo de no anticipar
          </h2>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            Sin predicción, el productor reacciona cuando el daño ya empezó.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {STATS.map((stat, i) => (
            <ScrollReveal key={stat.number} className="md:col-span-2" delay={i * 0.1}>
              <BentoItem className="h-full flex flex-col items-center text-center">
                <div className="p-2.5 rounded-lg bg-white/5 border border-stone-700/50 w-fit mb-4">
                  <stat.icon className="w-6 h-6 text-stone-300" />
                </div>
                <span className="text-4xl md:text-5xl font-bold text-emerald-400 font-[family-name:var(--font-geist-mono)]">
                  {stat.number}
                </span>
                <p className="text-stone-300 text-sm font-medium mt-3">
                  {stat.subtitle}
                </p>
                <p className="text-stone-500 text-sm mt-2 leading-relaxed max-w-xs">
                  {stat.detail}
                </p>
              </BentoItem>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
