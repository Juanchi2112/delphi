"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { RISK_CONFIG } from "@/lib/constants";

const COLORS = {
  low: RISK_CONFIG.low.color,
  medium: RISK_CONFIG.medium.color,
  high: RISK_CONFIG.high.color,
};

export default function RiskDistribution({
  low,
  medium,
  high,
}: {
  low: number;
  medium: number;
  high: number;
}) {
  const data = [
    { name: "Bajo", value: low, color: COLORS.low },
    { name: "Moderado", value: medium, color: COLORS.medium },
    { name: "Crítico", value: high, color: COLORS.high },
  ];
  const total = low + medium + high;

  return (
    <div className="glass rounded-xl p-4">
      <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
        Distribución de riesgo
      </h4>
      <div className="flex items-center gap-6">
        <div className="w-32 h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={55}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1C1917",
                  border: "1px solid #44403C",
                  borderRadius: "8px",
                  color: "#FAFAF9",
                  fontSize: "12px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: d.color }}
              />
              <span className="text-xs text-stone-300">{d.name}</span>
              <span className="text-xs text-stone-500 font-[family-name:var(--font-geist-mono)]">
                {d.value} ({total > 0 ? ((d.value / total) * 100).toFixed(0) : 0}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
