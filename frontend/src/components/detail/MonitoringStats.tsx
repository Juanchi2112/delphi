"use client";

import type { MonitoringLocalidadDetail } from "@/lib/types";
import TrendIndicator from "./TrendIndicator";

export default function MonitoringStats({ data }: { data: MonitoringLocalidadDetail }) {
  const formatDate = (d: string) => {
    if (!d) return "—";
    const parts = d.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
    return d;
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-stone-800/50 rounded-lg p-3">
        <p className="text-xs text-stone-500">Capturas actuales</p>
        <p className="text-lg font-semibold text-stone-50 font-[family-name:var(--font-geist-mono)]">
          {data.capturas_actual != null ? data.capturas_actual : "—"}
        </p>
      </div>
      <div className="bg-stone-800/50 rounded-lg p-3">
        <p className="text-xs text-stone-500">Tendencia</p>
        <div className="mt-1">
          <TrendIndicator trend={data.trend} delta={data.trend_delta} />
        </div>
      </div>
      <div className="bg-stone-800/50 rounded-lg p-3">
        <p className="text-xs text-stone-500">Presion vecinos</p>
        <p className="text-lg font-semibold text-stone-50 font-[family-name:var(--font-geist-mono)]">
          {data.neighbor_pressure != null
            ? `${(data.neighbor_pressure * 100).toFixed(0)}%`
            : "—"}
        </p>
      </div>
      <div className="bg-stone-800/50 rounded-lg p-3">
        <p className="text-xs text-stone-500">Periodo</p>
        <p className="text-sm font-medium text-stone-200 mt-0.5">
          {formatDate(data.fecha_inicio)} — {formatDate(data.fecha_fin)}
        </p>
      </div>
    </div>
  );
}
