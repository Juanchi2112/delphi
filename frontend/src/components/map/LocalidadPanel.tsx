"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useMapStore } from "@/stores/useMapStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { getLocalidad, getMonitoringLocalidad, generateReport } from "@/lib/api";
import type { LocalidadDetail, MonitoringLocalidadDetail, ReportResponse } from "@/lib/types";
import RiskGauge from "@/components/detail/RiskGauge";
import RiskBadge from "@/components/detail/RiskBadge";
import AlertCategoryBadge from "@/components/detail/AlertCategoryBadge";
import TrendIndicator from "@/components/detail/TrendIndicator";
import ShapBars from "@/components/detail/ShapBars";
import ShapWaterfall from "@/components/detail/ShapWaterfall";
import CaptureStats from "@/components/detail/CaptureStats";
import MonitoringStats from "@/components/detail/MonitoringStats";
import MonitoringTimeline from "@/components/detail/MonitoringTimeline";
import InformeView from "@/components/dashboard/InformeView";

export default function LocalidadPanel() {
  const { selectedId, selectLocalidad, mode } = useMapStore();
  const [data, setData] = useState<LocalidadDetail | null>(null);
  const [monitoringData, setMonitoringData] = useState<MonitoringLocalidadDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (!selectedId) {
      setData(null);
      setMonitoringData(null);
      setReport(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);

    if (mode === "monitoreo") {
      getMonitoringLocalidad(selectedId)
        .then((d) => { if (!cancelled) setMonitoringData(d); })
        .catch((e) => { if (!cancelled) setError(e.message); })
        .finally(() => { if (!cancelled) setLoading(false); });
    } else {
      getLocalidad(selectedId)
        .then((d) => { if (!cancelled) setData(d); })
        .catch((e) => { if (!cancelled) setError(e.message); })
        .finally(() => { if (!cancelled) setLoading(false); });
    }

    return () => { cancelled = true; };
  }, [selectedId, mode]);

  return (
    <AnimatePresence>
      {selectedId && (
        <motion.aside
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          data-onboarding="localidad-panel"
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

          {/* Pre-season mode */}
          {mode === "precampana" && data && !loading && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-stone-50 pr-8">{data.localidad}</h3>
                <p className="text-sm text-stone-400">{data.provincia} · {data.region}</p>
                <p className="text-xs text-stone-500 font-[family-name:var(--font-geist-mono)] mt-1">
                  {data.lat.toFixed(4)}°, {data.lon.toFixed(4)}°
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <RiskBadge level={data.risk_level} />
                  <span className="text-xs text-stone-500">Temporada {data.temporada}</span>
                </div>
              </div>

              <RiskGauge score={data.risk_score} level={data.risk_level} />

              {data.shap_features?.length && data.shap_base_value != null ? (
                <ShapWaterfall features={data.shap_features} baseValue={data.shap_base_value} riskScore={data.risk_score} riskLevel={data.risk_level} />
              ) : (
                <ShapBars features={data.top_features} />
              )}

              <CaptureStats data={data} />

              {data.target_hist != null && (
                <div className="bg-stone-800/50 rounded-lg p-3">
                  <p className="text-xs text-stone-500">Historial de brotes</p>
                  <p className="text-sm font-medium mt-0.5">
                    {data.target_hist === 1
                      ? <span className="text-red-400">Brote registrado en temporada anterior</span>
                      : <span className="text-emerald-400">Sin brotes previos registrados</span>}
                  </p>
                </div>
              )}

              {user && !report && (
                <button
                  onClick={async () => {
                    setReportLoading(true);
                    try { const r = await generateReport(data.id); setReport(r); } catch { /* ignore */ } finally { setReportLoading(false); }
                  }}
                  disabled={reportLoading}
                  className="w-full py-2.5 bg-emerald-500 text-stone-950 font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                >
                  {reportLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                      Generando informe...
                    </span>
                  ) : "Generar Informe IA"}
                </button>
              )}

              {report && <InformeView report={report} onClose={() => setReport(null)} />}
            </div>
          )}

          {/* Monitoring mode */}
          {mode === "monitoreo" && monitoringData && !loading && (
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-stone-50 pr-8">{monitoringData.localidad}</h3>
                <p className="text-sm text-stone-400">{monitoringData.provincia} · {monitoringData.region}</p>
                <p className="text-xs text-stone-500 font-[family-name:var(--font-geist-mono)] mt-1">
                  {monitoringData.lat.toFixed(4)}°, {monitoringData.lon.toFixed(4)}°
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <AlertCategoryBadge category={monitoringData.alert_category} />
                  <TrendIndicator trend={monitoringData.trend} delta={monitoringData.trend_delta} />
                  <span className="text-xs text-stone-500">
                    Q{monitoringData.quincena_index}
                  </span>
                </div>
              </div>

              <RiskGauge score={monitoringData.risk_score} level={monitoringData.risk_level} />

              {/* Timeline */}
              {monitoringData.timeline?.length > 0 && (
                <MonitoringTimeline readings={monitoringData.timeline} />
              )}

              {/* Monitoring stats */}
              <MonitoringStats data={monitoringData} />

              {/* SHAP features */}
              {monitoringData.shap_features?.length && monitoringData.shap_base_value != null ? (
                <ShapWaterfall
                  features={monitoringData.shap_features}
                  baseValue={monitoringData.shap_base_value}
                  riskScore={monitoringData.risk_score}
                  riskLevel={monitoringData.risk_level}
                />
              ) : monitoringData.top_features?.length ? (
                <ShapBars features={monitoringData.top_features} />
              ) : null}
            </div>
          )}
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
