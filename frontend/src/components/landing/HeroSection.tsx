"use client";

import React from "react";
import { motion } from "motion/react";
import InfiniteGrid from "@/components/ui/the-infinite-grid";
import ShimmerButton from "@/components/ui/shimmer-button";
import HighlightCard from "@/components/ui/highlight-card";
import { DollarSign, MapPin, Wheat, Calendar } from "lucide-react";

export default function HeroSection({
  recordsValid,
  regionsCount,
  seasonsCount,
  children,
}: {
  recordsValid: number;
  regionsCount: number;
  seasonsCount: number;
  children?: React.ReactNode;
}) {
  return (
    <InfiniteGrid>
      <div className="flex flex-col items-center px-4 pt-24 md:pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center max-w-3xl mx-auto"
        >
          {/* Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-stone-50 mb-4 font-[family-name:var(--font-space-grotesk)]">
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
            <span className="text-stone-300 font-medium">330+ trampas de monitoreo</span>{" "}
            del INTA para predecir riesgo de chicharrita del maíz en toda Argentina.
          </p>

          {/* CTA */}
          <ShimmerButton
            onClick={() =>
              document.getElementById("mapa")?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-base"
          >
            Explorar el mapa →
          </ShimmerButton>
        </motion.div>

        {/* Stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full px-4"
        >
        <HighlightCard
          title="USD 2.500M"
          description={["en pérdidas anuales", "por chicharrita del maíz"]}
          icon={<DollarSign className="w-9 h-9 text-stone-300" />}
        />
        <HighlightCard
          title={`${recordsValid.toLocaleString("es-AR")}+`}
          description={["localidades monitoreadas", "en toda Argentina"]}
          icon={<MapPin className="w-9 h-9 text-stone-300" />}
        />
        <HighlightCard
          title={`${regionsCount}`}
          description={["regiones agrícolas", "bajo vigilancia activa"]}
          icon={<Wheat className="w-9 h-9 text-stone-300" />}
        />
        <HighlightCard
          title={`${seasonsCount}`}
          description={["temporadas de datos", "para entrenar modelos"]}
          icon={<Calendar className="w-9 h-9 text-stone-300" />}
        />
        </motion.div>
      </div>

      {children}
    </InfiniteGrid>
  );
}
