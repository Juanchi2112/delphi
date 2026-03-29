"use client";

import Link from "next/link";
import ScrollReveal from "@/components/ui/ScrollReveal";
import { BentoItem } from "@/components/ui/cybernetic-bento-grid";
import {
  MapPin,
  Brain,
  Map,
  ShieldAlert,
  Radio,
  Crosshair,
} from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4 font-[family-name:var(--font-space-grotesk)]">
            ¿Qué hace Delphi?
          </h2>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            Todo lo que necesitás para anticipar el riesgo de chicharrita del
            maíz.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          {/* Card 1: 772+ Localidades */}
          <ScrollReveal className="md:col-span-2" delay={0.1}>
            <BentoItem className="h-full flex flex-col items-center justify-center text-center">
              <div className="p-2.5 rounded-lg bg-white/5 border border-stone-700/50 w-fit mb-4">
                <MapPin className="w-6 h-6 text-stone-300" />
              </div>
              <span className="text-5xl md:text-6xl font-bold text-stone-100 font-[family-name:var(--font-geist-mono)]">
                772+
              </span>
              <p className="text-stone-400 text-sm mt-3">
                localidades monitoreadas
                <br />
                en toda Argentina
              </p>
            </BentoItem>
          </ScrollReveal>

          {/* Card 2: ML Model */}
          <ScrollReveal className="md:col-span-2" delay={0.15}>
            <BentoItem className="h-full">
              <div className="p-2.5 rounded-lg bg-white/5 border border-stone-700/50 w-fit mb-4">
                <Brain className="w-6 h-6 text-stone-300" />
              </div>
              <h3 className="text-lg font-semibold text-stone-100 mb-2">
                Predicción con Machine Learning
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed mb-3">
                Modelo entrenado con 28 características climáticas y 2
                temporadas de datos reales de captura.
              </p>
              <Link
                href="/saber-mas"
                className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                Saber más →
              </Link>
            </BentoItem>
          </ScrollReveal>

          {/* Card 3: Explainability */}
          <ScrollReveal className="md:col-span-2" delay={0.2}>
            <BentoItem className="h-full">
              <div className="p-2.5 rounded-lg bg-white/5 border border-stone-700/50 w-fit mb-4">
                <Brain className="w-6 h-6 text-stone-300" />
              </div>
              <h3 className="text-lg font-semibold text-stone-100 mb-2">
                Un agente que te explica el porqué
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed">
                No te damos solo un número. Delphi te explica qué factores están
                empujando el riesgo en tu zona — para que entiendas la predicción
                y tomes mejores decisiones.
              </p>
            </BentoItem>
          </ScrollReveal>

          {/* Card: 14-Day Tactical Model (full width) */}
          <ScrollReveal className="md:col-span-6" delay={0.12}>
            <BentoItem className="h-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-stone-700/50 w-fit mb-4">
                    <Crosshair className="w-6 h-6 text-stone-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100 mb-2">
                    Predicción Táctica a 14 Días
                  </h3>
                  <p className="text-sm text-stone-400 leading-relaxed max-w-lg">
                    Nuestro segundo motor predictivo. Usando 44 variables —
                    capturas recientes, propagación espacial de vecinos, clima
                    actual y pronóstico — el modelo anticipa brotes antes de que
                    se manifiesten en tu zona.
                  </p>
                  <p className="text-xs text-stone-500 mt-3">
                    Base del sistema de alertas y créditos.
                  </p>
                </div>
                <div className="flex gap-8 md:gap-12">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-emerald-400 font-[family-name:var(--font-geist-mono)]">
                      0.95
                    </span>
                    <p className="text-xs text-stone-500 mt-1">AUC-ROC</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-stone-100 font-[family-name:var(--font-geist-mono)]">
                      44
                    </span>
                    <p className="text-xs text-stone-500 mt-1">variables</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-stone-100 font-[family-name:var(--font-geist-mono)]">
                      14d
                    </span>
                    <p className="text-xs text-stone-500 mt-1">horizonte</p>
                  </div>
                </div>
              </div>
            </BentoItem>
          </ScrollReveal>

          {/* Card 4: Interactive Map */}
          <ScrollReveal className="md:col-span-3" delay={0.2}>
            <BentoItem className="h-full">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-stone-700/50 w-fit mb-4">
                    <Map className="w-6 h-6 text-stone-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100 mb-2">
                    Mapa de Riesgo Interactivo
                  </h3>
                  <p className="text-sm text-stone-400 leading-relaxed">
                    Visualización geográfica de riesgo por localidad. Filtrá por
                    temporada, región y nivel de riesgo.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="text-xs text-stone-400">Bajo</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-xs text-stone-400">Moderado</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="text-xs text-stone-400">Crítico</span>
                </div>
              </div>
            </BentoItem>
          </ScrollReveal>

          {/* Card 5: Risk Alerts */}
          <ScrollReveal className="md:col-span-3" delay={0.25}>
            <BentoItem className="h-full">
              <div className="p-2.5 rounded-lg bg-white/5 border border-stone-700/50 w-fit mb-4">
                <ShieldAlert className="w-6 h-6 text-stone-300" />
              </div>
              <h3 className="text-lg font-semibold text-stone-100 mb-2">
                Alertas por Región
              </h3>
              <p className="text-sm text-stone-400 leading-relaxed">
                Clasificación automática de riesgo en regiones agrícolas.
                Detectá zonas críticas antes de que escale el brote.
              </p>
              <div className="flex flex-col gap-3 mt-6">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-[60%] rounded-full bg-emerald-400/30" />
                  </div>
                  <span className="text-xs text-stone-500 w-16">Bajo</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-[30%] rounded-full bg-amber-400/30" />
                  </div>
                  <span className="text-xs text-stone-500 w-16">Moderado</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full w-[10%] rounded-full bg-red-400/30" />
                  </div>
                  <span className="text-xs text-stone-500 w-16">Crítico</span>
                </div>
              </div>
            </BentoItem>
          </ScrollReveal>

          {/* Card 6: INTA Network (full width) */}
          <ScrollReveal className="md:col-span-6" delay={0.3}>
            <BentoItem className="h-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex-1">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-stone-700/50 w-fit mb-4">
                    <Radio className="w-6 h-6 text-stone-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100 mb-2">
                    Red de Monitoreo INTA
                  </h3>
                  <p className="text-sm text-stone-400 leading-relaxed max-w-lg">
                    Datos reales de 330+ trampas de la Red Nacional de
                    Monitoreo del INTA, con reportes quincenales de captura de
                    adultos por trampa.
                  </p>
                </div>
                <div className="flex gap-8 md:gap-12">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-stone-100 font-[family-name:var(--font-geist-mono)]">
                      330+
                    </span>
                    <p className="text-xs text-stone-500 mt-1">trampas</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-stone-100 font-[family-name:var(--font-geist-mono)]">
                      6
                    </span>
                    <p className="text-xs text-stone-500 mt-1">regiones</p>
                  </div>
                  <div className="text-center">
                    <span className="text-3xl font-bold text-stone-100 font-[family-name:var(--font-geist-mono)]">
                      38
                    </span>
                    <p className="text-xs text-stone-500 mt-1">reportes</p>
                  </div>
                </div>
              </div>
            </BentoItem>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
