"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMapStore } from "@/stores/useMapStore";
import { getLocalidad } from "@/lib/api";
import type { LocalidadDetail } from "@/lib/types";
import RiskGauge from "@/components/detail/RiskGauge";
import RiskBadge from "@/components/detail/RiskBadge";
import ShapBars from "@/components/detail/ShapBars";
import CaptureStats from "@/components/detail/CaptureStats";

export default function LocalidadPanel() {
  const { selectedId, selectLocalidad } = useMapStore();
  const [data, setData] = useState<LocalidadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setData(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getLocalidad(selectedId)
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  return (
    <AnimatePresence>
      {selectedId && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="absolute right-0 top-0 bottom-0 w-[360px] bg-stone-900/95 backdrop-blur-xl border-l border-stone-700 z-[1001] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={() => selectLocalidad(null)}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-200 transition-colors z-10 cursor-pointer"
            aria-label="Cerrar"
          >
            ✕
          </button>

          {loading && (
            <div className="p-6 space-y-4 animate-pulse">
              <div className="h-5 bg-stone-800 rounded w-2/3" />
              <div className="h-3 bg-stone-800 rounded w-1/3" />
              <div className="h-24 bg-stone-800 rounded-xl" />
              <div className="h-20 bg-stone-800 rounded-xl" />
            </div>
          )}

          {error && (
            <div className="p-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {data && !loading && (
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <h3 className="text-lg font-semibold text-stone-50 pr-8">
                  {data.localidad}
                </h3>
                <p className="text-sm text-stone-400">
                  {data.provincia} · {data.region}
                </p>
                <p className="text-xs text-stone-500 font-[family-name:var(--font-geist-mono)] mt-1">
                  {data.lat.toFixed(4)}°, {data.lon.toFixed(4)}°
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <RiskBadge level={data.risk_level} />
                  <span className="text-xs text-stone-500">
                    Temporada {data.temporada}
                  </span>
                </div>
              </div>

              {/* Gauge */}
              <RiskGauge score={data.risk_score} level={data.risk_level} />

              {/* SHAP features */}
              <ShapBars features={data.top_features} />

              {/* Capture stats */}
              <CaptureStats data={data} />

              {/* Historical outbreak */}
              {data.target_hist != null && (
                <div className="bg-stone-800/50 rounded-lg p-3">
                  <p className="text-xs text-stone-500">Historial de brotes</p>
                  <p className="text-sm font-medium mt-0.5">
                    {data.target_hist === 1 ? (
                      <span className="text-red-400">Brote registrado en temporada anterior</span>
                    ) : (
                      <span className="text-emerald-400">Sin brotes previos registrados</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
