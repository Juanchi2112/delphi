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
      <div className="h-2 rounded-full overflow-hidden flex bg-stone-800">
        {total > 0 && (
          <>
            <div
              style={{
                width: `${(low / total) * 100}%`,
                backgroundColor: RISK_CONFIG.low.color,
              }}
            />
            <div
              style={{
                width: `${(medium / total) * 100}%`,
                backgroundColor: RISK_CONFIG.medium.color,
              }}
            />
            <div
              style={{
                width: `${(high / total) * 100}%`,
                backgroundColor: RISK_CONFIG.high.color,
              }}
            />
          </>
        )}
      </div>

      <div className="flex justify-between text-xs text-stone-400">
        <span>Riesgo prom: {(avgRisk * 100).toFixed(0)}%</span>
        <span className="text-red-400">{pctHigh}% crítico</span>
      </div>
    </div>
  );
}
