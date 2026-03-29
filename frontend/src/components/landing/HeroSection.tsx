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
          {/* Animated logo — ping radar */}
          <div className="flex justify-center mb-6">
            <svg className="w-20 h-20 overflow-visible" viewBox="0 0 56 56">
              <path d="M28,6 A22,22 0 1,1 8,34" fill="none" stroke="#fff" strokeWidth="1" opacity=".15"/>
              <path d="M28,12 A16,16 0 1,1 14,32" fill="none" stroke="#fff" strokeWidth="1" opacity=".25"/>
              <path d="M28,18 A10,10 0 1,1 20,30" fill="none" stroke="#fff" strokeWidth="1.2" opacity=".45"/>
              <circle className="hero-ping" cx="28" cy="28" r="4" fill="none" stroke="#fff" strokeWidth="1.5"/>
              <circle className="hero-core" cx="28" cy="28" r="4" fill="#fff"/>
            </svg>
          </div>

          {/* Headline */}
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-stone-50 mb-4 font-[family-name:var(--font-space-grotesk)]">
            Delphi
          </h1>
          <p className="text-xl md:text-2xl text-emerald-400 font-medium mb-8">
            Conocé el riesgo antes de sembrar.
          </p>

          {/* Subtitle */}
          <p className="text-stone-400 text-base md:text-lg max-w-lg mx-auto mb-10 leading-relaxed">
            La chicharrita del maíz puede destruir una campaña entera. Delphi te avisa antes de que eso pase.
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
