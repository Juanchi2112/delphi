"use client";

import { Trash2 } from "lucide-react";
import { useCamposStore, type Campo } from "@/stores/useCamposStore";
import { supabase } from "@/lib/supabase";
import RiskBadge from "@/components/detail/RiskBadge";
import TrendIndicator from "@/components/detail/TrendIndicator";
import { ALERT_CONFIG } from "@/lib/constants";
import type { RiskLevel, MonitoringScoreItem } from "@/lib/types";

export default function CampoCard({
  campo,
  monitoring,
}: {
  campo: Campo;
  monitoring?: MonitoringScoreItem | null;
}) {
  const { selectedCampoId, selectCampo, removeCampo } = useCamposStore();
  const isSelected = selectedCampoId === campo.id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("campos").delete().eq("id", campo.id);
    removeCampo(campo.id);
  };

  return (
    <div
      onClick={() => selectCampo(isSelected ? null : campo.id)}
      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
        isSelected
          ? "bg-emerald-500/10 border-emerald-500/30"
          : "bg-stone-800/50 border-stone-700/50 hover:border-stone-600"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-stone-200 truncate">
            {campo.nombre}
          </p>
          <p className="text-xs text-stone-500 font-[family-name:var(--font-geist-mono)] mt-0.5">
            {campo.hectareas.toFixed(0)} ha
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {campo.risk_level && (
            <RiskBadge level={campo.risk_level as RiskLevel} />
          )}
          <button
            onClick={handleDelete}
            className="p-1 text-stone-600 hover:text-red-400 transition-colors cursor-pointer"
            title="Eliminar campo"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {campo.risk_score != null && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <div className="flex-1 h-1 bg-stone-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.round(campo.risk_score * 100)}%`,
                backgroundColor:
                  campo.risk_score >= 0.65
                    ? "#DC2626"
                    : campo.risk_score >= 0.35
                      ? "#F59E0B"
                      : "#10B981",
              }}
            />
          </div>
          <span className="text-[10px] text-stone-500 font-[family-name:var(--font-geist-mono)]">
            {Math.round(campo.risk_score * 100)}%
          </span>
        </div>
      )}
      {/* Monitoring indicator */}
      {monitoring && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${monitoring.alert_category === "brote_riesgo_alto" ? "animate-pulse" : ""}`}
            style={{ backgroundColor: ALERT_CONFIG[monitoring.alert_category].color }}
          />
          <TrendIndicator trend={monitoring.trend} delta={monitoring.trend_delta} />
          {monitoring.capturas_actual != null && monitoring.capturas_actual > 0 && (
            <span className="text-stone-500 font-[family-name:var(--font-geist-mono)]">
              {monitoring.capturas_actual} cap.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
