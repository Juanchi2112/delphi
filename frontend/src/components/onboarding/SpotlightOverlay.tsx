"use client";

import { motion } from "motion/react";

interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const SPRING = { type: "spring" as const, stiffness: 120, damping: 22 };

export default function SpotlightOverlay({ rect }: { rect: SpotlightRect | null }) {
  const hole = rect ?? { x: 0, y: 0, width: 0, height: 0 };

  return (
    <svg
      className="fixed inset-0 w-full h-full z-[1500] pointer-events-none"
      style={{ pointerEvents: "none" }}
    >
      <defs>
        <mask id="spotlight-mask">
          {/* White = visible overlay (darkened area) */}
          <rect x="0" y="0" width="100%" height="100%" fill="white" />
          {/* Black = transparent hole (spotlight) */}
          <motion.rect
            animate={{
              x: hole.x,
              y: hole.y,
              width: hole.width,
              height: hole.height,
            }}
            transition={SPRING}
            rx={12}
            ry={12}
            fill="black"
          />
        </mask>
      </defs>
      {/* Dark overlay with hole punched out */}
      <rect
        x="0"
        y="0"
        width="100%"
        height="100%"
        fill="rgba(0,0,0,0.72)"
        mask="url(#spotlight-mask)"
        style={{ pointerEvents: "auto" }}
      />
    </svg>
  );
}
