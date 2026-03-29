"use client";

import { motion } from "motion/react";
import type { ReportResponse } from "@/lib/types";

const PRIORIDAD_COLORS: Record<string, string> = {
  alta: "bg-red-500/20 text-red-400 border-red-500/30",
  media: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  baja: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

const CATEGORIA_LABELS: Record<string, string> = {
  fecha_siembra: "Fecha de siembra",
  hibrido: "Hibrido",
  proteccion: "Proteccion",
  monitoreo: "Monitoreo",
  rotacion: "Rotacion",
};

export default function InformeView({
  report,
  onClose,
}: {
  report: ReportResponse;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider">
            Informe de Riesgo
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {report.localidad} · {report.provincia} · {report.region}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-stone-500 hover:text-stone-300 transition-colors cursor-pointer"
        >
          Cerrar
        </button>
      </div>

      {/* Summary */}
      <div className="bg-stone-800/50 border border-stone-700/50 rounded-lg p-3">
        <p className="text-sm text-stone-200 leading-relaxed">
          {report.resumen}
        </p>
      </div>

      {/* Factors */}
      {report.factores.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Factores clave
          </h4>
          <div className="space-y-2">
            {report.factores.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="flex items-start gap-2 text-xs"
              >
                <span
                  className={`shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full ${
                    f.impacto === "positivo" ? "bg-red-400" : "bg-emerald-400"
                  }`}
                />
                <div>
                  <span className="text-stone-300 font-medium">{f.factor}</span>
                  <span className="text-stone-500"> — {f.explicacion}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {report.recomendaciones.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Recomendaciones
          </h4>
          <div className="space-y-2">
            {report.recomendaciones.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-stone-800/30 border border-stone-700/30 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded border ${
                      PRIORIDAD_COLORS[r.prioridad] ?? PRIORIDAD_COLORS.media
                    }`}
                  >
                    {r.prioridad.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-stone-500">
                    {CATEGORIA_LABELS[r.categoria] ?? r.categoria}
                  </span>
                </div>
                <p className="text-xs text-stone-200 font-medium">
                  {r.accion}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {r.justificacion}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Regional context */}
      {report.contexto_regional && (
        <div>
          <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
            Contexto regional
          </h4>
          <p className="text-xs text-stone-400 leading-relaxed">
            {report.contexto_regional}
          </p>
        </div>
      )}

      <p className="text-[10px] text-stone-600 text-right">
        Generado: {new Date(report.generated_at).toLocaleString("es-AR")}
      </p>
    </motion.div>
  );
}
