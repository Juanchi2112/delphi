"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { useCamposStore, type Campo } from "@/stores/useCamposStore";
import { supabase } from "@/lib/supabase";
import { generateReport, getMonitoringLocalidad } from "@/lib/api";
import { extractLocalidadKey } from "@/lib/utils";
import type { RiskLevel, ReportResponse, MonitoringLocalidadDetail } from "@/lib/types";
import RiskBadge from "@/components/detail/RiskBadge";
import AlertCategoryBadge from "@/components/detail/AlertCategoryBadge";
import TrendIndicator from "@/components/detail/TrendIndicator";
import MonitoringTimeline from "@/components/detail/MonitoringTimeline";
import MonitoringStats from "@/components/detail/MonitoringStats";
import InformeView from "./InformeView";

export default function CampoDetail({ campo }: { campo: Campo }) {
  const { selectCampo, removeCampo } = useCamposStore();
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [monData, setMonData] = useState<MonitoringLocalidadDetail | null>(null);

  useEffect(() => {
    if (!campo.localidad_id) return;
    const key = extractLocalidadKey(campo.localidad_id);
    getMonitoringLocalidad(key)
      .then(setMonData)
      .catch(() => setMonData(null));
  }, [campo.localidad_id]);

  const riskPct = campo.risk_score != null ? Math.round(campo.risk_score * 100) : null;
  const riskColor =
    campo.risk_score != null && campo.risk_score >= 0.65
      ? "#DC2626"
      : campo.risk_score != null && campo.risk_score >= 0.35
        ? "#F59E0B"
        : "#10B981";

  const handleDelete = async () => {
    await supabase.from("campos").delete().eq("id", campo.id);
    removeCampo(campo.id);
  };

  const [reportError, setReportError] = useState<string | null>(null);

  const handleGenerateReport = async () => {
    if (!campo.localidad_id) return;
    setReportLoading(true);
    setReportError(null);
    try {
      const r = await generateReport(campo.localidad_id, {
        campo_nombre: campo.nombre,
        hectareas: campo.hectareas,
      });
      setReport(r);
    } catch (e) {
      setReportError("No se pudo generar el informe. Intenta eliminar el campo y crearlo de nuevo.");
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b border-stone-700/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => selectCampo(null)}
            className="p-1 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-stone-200 truncate">
              {campo.nombre}
            </h3>
          </div>
          <button
            onClick={handleDelete}
            className="p-1 text-stone-600 hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-stone-800/50 rounded-lg p-3">
            <p className="text-[10px] text-stone-500 uppercase">Hectareas</p>
            <p className="text-lg font-semibold text-stone-200 font-[family-name:var(--font-geist-mono)]">
              {campo.hectareas.toFixed(0)}
            </p>
          </div>
          <div className="bg-stone-800/50 rounded-lg p-3">
            <p className="text-[10px] text-stone-500 uppercase">Riesgo</p>
            {riskPct != null ? (
              <p
                className="text-lg font-semibold font-[family-name:var(--font-geist-mono)]"
                style={{ color: riskColor }}
              >
                {riskPct}%
              </p>
            ) : (
              <p className="text-lg text-stone-500">—</p>
            )}
          </div>
        </div>

        {/* Risk badge + level */}
        {campo.risk_level && (
          <div className="flex items-center gap-2">
            <RiskBadge level={campo.risk_level as RiskLevel} />
            <span className="text-xs text-stone-500">
              Basado en localidad mas cercana
            </span>
          </div>
        )}

        {/* Risk bar */}
        {campo.risk_score != null && (
          <div>
            <div className="flex justify-between text-xs text-stone-500 mb-1">
              <span>Score de riesgo</span>
              <span className="font-[family-name:var(--font-geist-mono)]">
                {campo.risk_score.toFixed(4)}
              </span>
            </div>
            <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${riskPct}%`,
                  backgroundColor: riskColor,
                }}
              />
            </div>
          </div>
        )}

        {/* Monitoring section */}
        {monData && (
          <>
            <div className="border-t border-stone-700/50 pt-4">
              <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                Monitoreo Quincenal
              </h4>
              <div className="flex items-center gap-2 mb-3">
                <AlertCategoryBadge category={monData.alert_category} />
                <TrendIndicator trend={monData.trend} delta={monData.trend_delta} />
              </div>
              <MonitoringStats data={monData} />
            </div>
            {monData.timeline?.length > 0 && (
              <MonitoringTimeline readings={monData.timeline} />
            )}
          </>
        )}

        {/* Generate report button */}
        {!report && (
          <>
            <button
              onClick={handleGenerateReport}
              disabled={reportLoading || !campo.localidad_id}
              className="w-full py-2.5 bg-emerald-500 text-stone-950 font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {reportLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                  Generando informe...
                </span>
              ) : (
                "Generar Informe IA"
              )}
            </button>
            {reportError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {reportError}
              </p>
            )}
          </>
        )}

        {/* Report */}
        {report && (
          <InformeView report={report} onClose={() => setReport(null)} />
        )}
      </div>
    </>
  );
}
