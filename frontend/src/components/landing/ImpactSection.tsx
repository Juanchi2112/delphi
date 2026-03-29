"use client";

import Link from "next/link";
import { DollarSign, MapPin, Target } from "lucide-react";
import { BentoItem } from "@/components/ui/cybernetic-bento-grid";
import ScrollReveal from "@/components/ui/ScrollReveal";

const STATS = [
  {
    number: "USD 3.679M",
    subtitle: "en perdidas documentadas",
    detail:
      "Impacto total de la chicharrita en la campana 2023/24. Fuente: Bolsa de Comercio de Rosario.",
    icon: DollarSign,
  },
  {
    number: "913",
    subtitle: "localidades analizadas",
    detail:
      "Datos reales de la Red Nacional de Monitoreo del INTA, con 38 reportes quincenales en 2 temporadas.",
    icon: MapPin,
  },
  {
    number: "0.88",
    subtitle: "AUC-ROC del modelo",
    detail:
      "Precision del modelo predictivo entrenado con 36 variables climaticas, geograficas y de monitoreo.",
    icon: Target,
  },
];

export default function ImpactSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
            Delphi en numeros
          </h2>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            Datos reales, modelo validado, cobertura nacional.
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

        <ScrollReveal delay={0.4}>
          <div className="text-center mt-10">
            <Link
              href="/saber-mas"
              className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
            >
              Saber más →
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
