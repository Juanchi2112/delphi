import { RISK_CONFIG } from "@/lib/constants";

export default function RegionCard({
  name,
  total,
  low,
  medium,
  high,
  avgRisk,
}: {
  name: string;
  total: number;
  low: number;
  medium: number;
  high: number;
  avgRisk: number;
}) {
  const pctHigh = total > 0 ? ((high / total) * 100).toFixed(0) : "0";

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-stone-200">{name}</h4>
        <span className="text-xs text-stone-500 font-[family-name:var(--font-geist-mono)]">
          {total} loc.
        </span>
      </div>

      {/* Risk distribution bar */}
      <div className="h-1.5 rounded-full overflow-hidden flex bg-stone-800">
        {total > 0 && (
          <>
            <div
              style={{
                width: `${(low / total) * 100}%`,
                backgroundColor: RISK_CONFIG.low.color,
                opacity: 0.7,
              }}
            />
            <div
              style={{
                width: `${(medium / total) * 100}%`,
                backgroundColor: RISK_CONFIG.medium.color,
                opacity: 0.7,
              }}
            />
            <div
              style={{
                width: `${(high / total) * 100}%`,
                backgroundColor: RISK_CONFIG.high.color,
                opacity: 0.7,
              }}
            />
          </>
        )}
      </div>

      <div className="flex justify-between text-xs">
        <span className="text-stone-500">
          Riesgo prom: <span className="text-stone-300 font-[family-name:var(--font-geist-mono)]">{(avgRisk * 100).toFixed(0)}%</span>
        </span>
        <span className="text-stone-500">
          Crítico: <span className="text-stone-300 font-[family-name:var(--font-geist-mono)]">{pctHigh}%</span>
        </span>
      </div>
    </div>
  );
}
