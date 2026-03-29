"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";
import { RISK_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/lib/types";

const SIZE = 180;
const STROKE = 14;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = Math.PI * RADIUS;

export default function RiskGauge({
  score,
  level,
}: {
  score: number;
  level: RiskLevel;
}) {
  const percent = Math.round(score * 100);
  const config = RISK_CONFIG[level];

  const springValue = useSpring(0, { stiffness: 80, damping: 18 });
  const dashOffset = useTransform(
    springValue,
    [0, 1],
    [CIRCUMFERENCE, CIRCUMFERENCE * (1 - score)]
  );

  useEffect(() => {
    springValue.set(1);
    return () => springValue.set(0);
  }, [score, springValue]);

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={SIZE} height={SIZE / 2 + 10} viewBox={`0 0 ${SIZE} ${SIZE / 2 + 10}`}>
        {/* Background arc */}
        <path
          d={`M ${STROKE / 2} ${SIZE / 2} A ${RADIUS} ${RADIUS} 0 0 1 ${SIZE - STROKE / 2} ${SIZE / 2}`}
          fill="none"
          stroke="#292524"
          strokeWidth={STROKE}
          strokeLinecap="round"
        />
        {/* Colored arc */}
        <motion.path
          d={`M ${STROKE / 2} ${SIZE / 2} A ${RADIUS} ${RADIUS} 0 0 1 ${SIZE - STROKE / 2} ${SIZE / 2}`}
          fill="none"
          stroke={config.color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <div className="flex flex-col items-center -mt-6">
        <span
          className="text-5xl font-bold tracking-tight font-[family-name:var(--font-geist-mono)]"
          style={{ color: config.color }}
        >
          {percent}
        </span>
        <span
          className="text-xs font-semibold tracking-widest uppercase mt-1"
          style={{ color: config.color }}
        >
          {config.label}
        </span>
        <span className="text-stone-500 text-xs mt-1">Riesgo de presencia</span>
      </div>
    </div>
  );
}
