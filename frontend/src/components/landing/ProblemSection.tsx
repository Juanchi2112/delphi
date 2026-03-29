"use client";

import { Wheat, Clock, HelpCircle } from "lucide-react";
import HighlightCard from "@/components/ui/highlight-card";
import ScrollReveal from "@/components/ui/ScrollReveal";

const PROBLEMS = [
  {
    title: "La plaga",
    description: [
      "La chicharrita del maíz puede destruir hasta el 100% de un lote.",
      "En la campaña 23/24, Argentina perdió más de un tercio de su producción.",
    ],
    icon: <Wheat className="w-8 h-8 text-stone-300" />,
  },
  {
    title: "La información",
    description: [
      "El monitoreo actual son reportes cada 15 días, datos sueltos y sin conexión.",
      "Cuando la señal llega, el daño ya empezó.",
    ],
    icon: <Clock className="w-8 h-8 text-stone-300" />,
  },
  {
    title: "La decisión",
    description: [
      "El productor decide qué sembrar, cuándo y con qué híbrido —",
      "sin ningún indicador de riesgo unificado.",
    ],
    icon: <HelpCircle className="w-8 h-8 text-stone-300" />,
  },
];

export default function ProblemSection() {
  return (
    <section className="py-20 px-4">
      <ScrollReveal>
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
            El problema: hoy se llega tarde.
          </h2>
        </div>
      </ScrollReveal>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {PROBLEMS.map((p, i) => (
          <ScrollReveal key={p.title} delay={i * 0.1}>
            <HighlightCard
              title={p.title}
              description={p.description}
              icon={p.icon}
            />
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}
