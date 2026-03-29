import type { LocalidadDetail } from "@/lib/types";

export default function CaptureStats({ data }: { data: LocalidadDetail }) {
  const stats = [
    { label: "Capturas máx.", value: data.max_capturas?.toFixed(0) ?? "—" },
    { label: "Capturas prom.", value: data.mean_capturas?.toFixed(1) ?? "—" },
    { label: "Lecturas", value: data.n_lecturas?.toString() ?? "—" },
    { label: "Detecciones", value: data.n_detecciones?.toString() ?? "—" },
  ];

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
        Datos de trampas
      </h4>
      <div className="grid grid-cols-2 gap-2">
        {stats.map((s) => (
          <div key={s.label} className="bg-stone-800/50 rounded-lg p-2.5">
            <p className="text-xs text-stone-500">{s.label}</p>
            <p className="text-sm font-semibold font-[family-name:var(--font-geist-mono)] text-stone-200">
              {s.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
