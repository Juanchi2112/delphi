"use client";

import React from "react";
import { motion } from "motion/react";
import InfiniteGrid from "@/components/ui/the-infinite-grid";
import ShimmerButton from "@/components/ui/shimmer-button";

export default function HeroSection({
  children,
}: {
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

      </div>

      {children}
    </InfiniteGrid>
  );
}
