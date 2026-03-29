"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { ALERT_CONFIG } from "@/lib/constants";
import type { TimelineReading } from "@/lib/types";

function formatDate(d: string) {
  if (!d) return "";
  const parts = d.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}`;
  return d;
}

export default function MonitoringTimeline({
  readings,
}: {
  readings: TimelineReading[];
}) {
  if (!readings.length) return null;

  const data = readings.map((r) => ({
    ...r,
    label: formatDate(r.fecha_inicio),
    score_pct: Math.round(r.risk_score * 100),
    color: ALERT_CONFIG[r.alert_category]?.color ?? "#A8A29E",
  }));

  return (
    <div className="bg-stone-800/50 rounded-lg p-3">
      <p className="text-xs text-stone-500 mb-2">Evolucion del riesgo quincenal</p>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#DC2626" stopOpacity={0.4} />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#292524" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#78716C" }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#78716C" }}
            tickFormatter={(v: number) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1917",
              border: "1px solid #44403C",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: unknown) => [`${value}%`, "Riesgo"]}
            labelFormatter={(label: unknown) => `Periodo: ${label}`}
          />
          <ReferenceLine y={35} stroke="#F59E0B" strokeDasharray="3 3" strokeOpacity={0.5} />
          <ReferenceLine y={65} stroke="#DC2626" strokeDasharray="3 3" strokeOpacity={0.5} />
          <Area
            type="monotone"
            dataKey="score_pct"
            stroke="#10B981"
            fill="url(#riskGradient)"
            strokeWidth={2}
            dot={(props: Record<string, unknown>) => {
              const { cx, cy, index } = props as { cx: number; cy: number; index: number };
              const isLast = index === data.length - 1;
              const color = data[index]?.color ?? "#10B981";
              return (
                <circle
                  key={index}
                  cx={cx}
                  cy={cy}
                  r={isLast ? 5 : 3}
                  fill={color}
                  stroke={isLast ? "#FAFAF9" : "none"}
                  strokeWidth={isLast ? 2 : 0}
                />
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
