"use client";

import { motion } from "motion/react";
import { useOnboardingStore, ONBOARDING_STEPS } from "@/stores/useOnboardingStore";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const GAP = 16;
const CARD_W = 300;
const CARD_H_EST = 200;
const NAV_H = 80; // navbar height reserve
const SPRING = { type: "spring" as const, stiffness: 100, damping: 20 };

function computePosition(
  rect: Rect,
  placement: "top" | "bottom" | "left" | "right"
): { top: number; left: number; actualPlacement: "top" | "bottom" | "left" | "right" } {
  const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;

  let top = 0;
  let left = 0;
  let actualPlacement = placement;

  // For very tall targets (like the full map), position inside the target
  const targetIsTall = rect.height > vh * 0.5;

  switch (placement) {
    case "bottom": {
      if (targetIsTall) {
        // Place inside the target, centered vertically
        top = Math.max(rect.y + NAV_H + GAP, rect.y + rect.height / 2 - CARD_H_EST / 2);
      } else {
        top = rect.y + rect.height + GAP;
      }
      left = rect.x + rect.width / 2 - CARD_W / 2;
      if (top + CARD_H_EST > vh - GAP) {
        top = rect.y - CARD_H_EST - GAP;
        actualPlacement = "top";
      }
      break;
    }
    case "top": {
      top = rect.y - CARD_H_EST - GAP;
      left = rect.x + rect.width / 2 - CARD_W / 2;
      if (top < NAV_H) {
        top = rect.y + rect.height + GAP;
        actualPlacement = "bottom";
      }
      break;
    }
    case "right": {
      top = rect.y + rect.height / 2 - CARD_H_EST / 2;
      left = rect.x + rect.width + GAP;
      if (left + CARD_W > vw - GAP) {
        left = rect.x - CARD_W - GAP;
        actualPlacement = "left";
      }
      break;
    }
    case "left": {
      top = rect.y + rect.height / 2 - CARD_H_EST / 2;
      left = rect.x - CARD_W - GAP;
      if (left < GAP) {
        left = rect.x + rect.width + GAP;
        actualPlacement = "right";
      }
      break;
    }
  }

  // Clamp to viewport with navbar reserve
  left = Math.max(GAP, Math.min(left, vw - CARD_W - GAP));
  top = Math.max(NAV_H + GAP, Math.min(top, vh - CARD_H_EST - GAP));

  return { top, left, actualPlacement };
}

export default function TooltipCard({ rect }: { rect: Rect | null }) {
  const { currentStep, next, prev, skip } = useOnboardingStore();
  const step = ONBOARDING_STEPS[currentStep];
  const total = ONBOARDING_STEPS.length;
  const isLast = currentStep === total - 1;

  if (!rect || !step) return null;

  let top: number, left: number;
  if (step.fixedPosition) {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1400;
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;
    left = (step.fixedPosition[0] / 100) * vw;
    top = (step.fixedPosition[1] / 100) * vh;
  } else {
    const pos = computePosition(rect, step.placement);
    top = pos.top;
    left = pos.left;
  }

  return (
    <motion.div
      key={currentStep}
      animate={{ top, left, opacity: 1, scale: 1 }}
      initial={{ top, left, opacity: 0, scale: 0.95 }}
      transition={SPRING}
      className="fixed z-[1510] w-[300px]"
      style={{ pointerEvents: "auto" }}
    >
      <div className="relative bg-stone-800/95 backdrop-blur-xl border border-stone-700/60 rounded-xl px-5 py-4 shadow-2xl">
        {/* Step count */}
        <p className="text-[11px] text-stone-500 font-medium mb-1.5">
          {currentStep + 1} de {total}
        </p>

        {/* Title */}
        <h3 className="text-sm font-semibold text-stone-50 mb-1.5">{step.title}</h3>

        {/* Description */}
        <p className="text-xs text-stone-400 leading-relaxed mb-4">{step.description}</p>

        {/* Dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentStep
                  ? "w-4 bg-emerald-500"
                  : i < currentStep
                    ? "w-1.5 bg-emerald-500/40"
                    : "w-1.5 bg-stone-600"
              }`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={skip}
              className="text-xs text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
            >
              Omitir
            </button>
            {currentStep > 0 && (
              <button
                onClick={prev}
                className="text-xs text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                Anterior
              </button>
            )}
          </div>
          <button
            onClick={next}
            className="px-4 py-1.5 text-xs font-semibold bg-emerald-500 text-stone-950 rounded-lg hover:bg-emerald-400 transition-colors cursor-pointer"
          >
            {isLast ? "Finalizar" : "Siguiente"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
