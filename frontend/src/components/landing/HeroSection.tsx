"use client";

import { motion } from "motion/react";
import AnimatedStat from "./AnimatedStat";
import Button from "@/components/ui/Button";

export default function HeroSection({
  recordsValid,
  regionsCount,
  seasonsCount,
}: {
  recordsValid: number;
  regionsCount: number;
  seasonsCount: number;
}) {
  return (
    <section className="relative min-h-dvh flex flex-col items-center justify-center hero-glow px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center max-w-3xl mx-auto"
      >
        {/* Badge */}
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium tracking-wide uppercase mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Sistema de Inteligencia Predictiva
        </span>

        {/* Headline */}
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-stone-50 mb-4">
          Delphi
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-stone-400 mb-2">
          Anticipamos brotes de plagas
        </p>
        <p className="text-xl md:text-2xl text-emerald-400 font-medium mb-8">
          antes de que destruyan tu cosecha.
        </p>

        {/* Description */}
        <p className="text-stone-500 text-base max-w-lg mx-auto mb-10 leading-relaxed">
          Machine learning sobre datos climáticos reales y{" "}
          <span className="text-stone-300">330+ trampas de monitoreo</span>{" "}
          del INTA para predecir riesgo de chicharrita del maíz en toda Argentina.
        </p>

        {/* CTA */}
        <Button
          onClick={() =>
            document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth" })
          }
          className="text-base"
        >
          Explorar el mapa →
        </Button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10"
      >
        <AnimatedStat
          value={2500}
          prefix="USD "
          suffix="M"
          label="en pérdidas anuales"
        />
        <AnimatedStat
          value={recordsValid}
          suffix="+"
          label="localidades monitoreadas"
        />
        <AnimatedStat
          value={regionsCount}
          label="regiones agrícolas"
        />
        <AnimatedStat
          value={seasonsCount}
          label="temporadas de datos"
        />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-stone-600 text-sm"
        >
          ↓
        </motion.div>
      </motion.div>
    </section>
  );
}
