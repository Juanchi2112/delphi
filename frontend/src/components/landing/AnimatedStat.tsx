"use client";

import { useEffect, useRef, useState } from "react";
import { useSpring, useMotionValueEvent } from "motion/react";

export default function AnimatedStat({
  value,
  prefix = "",
  suffix = "",
  label,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [inView, setInView] = useState(false);
  const spring = useSpring(0, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (inView) spring.set(value);
  }, [inView, value, spring]);

  useMotionValueEvent(spring, "change", (v) => {
    if (ref.current) {
      const rounded = Math.round(v);
      const formatted = rounded.toLocaleString("es-AR");
      ref.current.textContent = `${prefix}${formatted}${suffix}`;
    }
  });

  return (
    <div className="text-center">
      <span
        ref={ref}
        className="block text-4xl md:text-5xl font-bold tracking-tight text-stone-50 font-[family-name:var(--font-geist-mono)]"
      >
        {prefix}0{suffix}
      </span>
      <span className="text-sm text-stone-400 mt-1 block">{label}</span>
    </div>
  );
}
