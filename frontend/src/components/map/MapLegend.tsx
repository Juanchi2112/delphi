import { RISK_CONFIG } from "@/lib/constants";

export default function MapLegend() {
  return (
    <div className="absolute bottom-6 left-4 z-[1000] glass-subtle rounded-lg px-3 py-2 flex items-center gap-4">
      {(["low", "medium", "high"] as const).map((level) => {
        const cfg = RISK_CONFIG[level];
        return (
          <div key={level} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: cfg.color }}
            />
            <span className="text-xs text-stone-400">{cfg.label}</span>
          </div>
        );
      })}
    </div>
  );
}
