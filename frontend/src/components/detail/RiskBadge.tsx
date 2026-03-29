import { RISK_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/lib/types";

export default function RiskBadge({ level }: { level: RiskLevel }) {
  const config = RISK_CONFIG[level];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase"
      style={{
        backgroundColor: `${config.color}20`,
        color: config.color,
        border: `1px solid ${config.color}40`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: config.color }}
      />
      {config.label}
    </span>
  );
}
