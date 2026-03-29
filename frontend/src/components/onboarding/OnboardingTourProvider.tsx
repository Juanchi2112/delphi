"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { useOnboardingStore, ONBOARDING_STEPS } from "@/stores/useOnboardingStore";
import { useMapStore } from "@/stores/useMapStore";
import { useCamposStore } from "@/stores/useCamposStore";
import type { ScoreItem } from "@/lib/types";
import SpotlightOverlay from "./SpotlightOverlay";
import TooltipCard from "./TooltipCard";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const PAD = 8;

function getTargetRect(step: (typeof ONBOARDING_STEPS)[number]): Rect | null {
  if (step.querySelector) {
    const el = document.querySelector(step.querySelector);
    if (el) {
      const r = el.getBoundingClientRect();
      return { x: r.x - PAD, y: r.y - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
    }
  }
  const el = document.querySelector(`[data-onboarding="${step.target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.x - PAD, y: r.y - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 };
}

// Fake polygon near Córdoba for demo
const DEMO_POLYGON: GeoJSON.Polygon = {
  type: "Polygon",
  coordinates: [[
    [-63.5, -31.4],
    [-63.4, -31.4],
    [-63.4, -31.3],
    [-63.5, -31.3],
    [-63.5, -31.4],
  ]],
};

export default function OnboardingTourProvider({ items }: { items: ScoreItem[] }) {
  const { active, currentStep, completed, start, next, prev, skip, complete: completeTour } = useOnboardingStore();
  const selectLocalidad = useMapStore((s) => s.selectLocalidad);
  const { setPendingCampo, openDrawer } = useCamposStore();
  const [rect, setRect] = useState<Rect | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [mounted, setMounted] = useState(false);

  // One-time mount flag (survives strict mode double-run)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll lock when tour is active
  useEffect(() => {
    if (!active) return;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.removeEventListener("wheel", preventScroll);
      window.removeEventListener("touchmove", preventScroll);
    };
  }, [active]);

  // Side effects for simulated actions per step
  useEffect(() => {
    if (!active) return;
    const step = ONBOARDING_STEPS[currentStep];
    if (!step?.simulateAction) return;

    if (step.simulateAction === "select-localidad") {
      const demo = items.find((i) => i.risk_level === "high") ?? items[0];
      if (demo) {
        selectLocalidad(demo.id);
      }
      return () => {
        selectLocalidad(null);
      };
    }

    if (step.simulateAction === "simulate-draw") {
      const nearest = items[0];
      if (nearest) {
        setPendingCampo({
          geojson: DEMO_POLYGON,
          hectareas: 847,
          nearest,
        });
        openDrawer();
      }
      return () => {
        setPendingCampo(null);
      };
    }
  }, [active, currentStep, items, selectLocalidad, setPendingCampo, openDrawer]);

  // Trigger: scroll to map and start tour after mount
  useEffect(() => {
    if (!mounted || completed || active) return;

    const section = document.getElementById("mapa");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    const timer = setTimeout(() => start(), 1500);
    return () => clearTimeout(timer);
  }, [mounted, completed, active, start]);

  // Elevate the target element above the overlay so it's fully visible
  useEffect(() => {
    if (!active) return;
    const step = ONBOARDING_STEPS[currentStep];
    if (!step) return;

    let el: Element | null = null;
    let origZIndex = "";

    const elevate = () => {
      el = step.querySelector
        ? document.querySelector(step.querySelector)
        : document.querySelector(`[data-onboarding="${step.target}"]`);

      if (el instanceof HTMLElement) {
        origZIndex = el.style.zIndex;
        el.style.zIndex = "1502";
      }
    };

    // Delay slightly for elements that animate in (panel, drawer)
    const timer = setTimeout(elevate, step.simulateAction ? 400 : 0);

    return () => {
      clearTimeout(timer);
      if (el instanceof HTMLElement) {
        el.style.zIndex = origZIndex;
      }
    };
  }, [active, currentStep]);

  // Compute rect for current step (with delay for simulated actions)
  const updateRect = useCallback(() => {
    if (!active) return;
    const step = ONBOARDING_STEPS[currentStep];
    if (!step) return;

    const r = getTargetRect(step);
    if (r) {
      setRect(r);
      if (retryRef.current) clearTimeout(retryRef.current);
    } else {
      let attempts = 0;
      const retry = () => {
        attempts++;
        const r2 = getTargetRect(step);
        if (r2) {
          setRect(r2);
        } else if (attempts < 10) {
          // More retries for simulated actions that need time to render
          retryRef.current = setTimeout(retry, 200);
        } else {
          next();
        }
      };
      retryRef.current = setTimeout(retry, 200);
    }
  }, [active, currentStep, next]);

  useEffect(() => {
    updateRect();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [updateRect]);

  // Resize / scroll recalculation
  useEffect(() => {
    if (!active) return;

    let timer: ReturnType<typeof setTimeout>;
    const recalc = () => {
      clearTimeout(timer);
      timer = setTimeout(updateRect, 150);
    };

    window.addEventListener("resize", recalc);
    window.addEventListener("scroll", recalc, true);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", recalc);
      window.removeEventListener("scroll", recalc, true);
    };
  }, [active, updateRect]);

  // Keyboard navigation
  useEffect(() => {
    if (!active) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
      else if (e.key === "ArrowRight" || e.key === "Enter") next();
      else if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [active, next, prev, skip]);

  // Portal to body so overlay escapes overflow:hidden and transform contexts
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {active && rect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SpotlightOverlay rect={rect} />
          <TooltipCard rect={rect} />
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
