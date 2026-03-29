"use client";

import { useCamposStore } from "@/stores/useCamposStore";
import CampoCard from "./CampoCard";

const PRICE_PER_TIER = [
  { max: 500, label: "Productor", price: 39 },
  { max: 5000, label: "Asesor", price: 99 },
  { max: Infinity, label: "Corporativo", price: null },
];

function getTier(hectareas: number) {
  return PRICE_PER_TIER.find((t) => hectareas <= t.max) ?? PRICE_PER_TIER[2];
}

export default function CamposSidebar() {
  const { campos, loading } = useCamposStore();

  const totalHa = campos.reduce((sum, c) => sum + c.hectareas, 0);
  const tier = getTier(totalHa);

  return (
    <aside className="w-[320px] bg-stone-900/95 backdrop-blur-xl border-r border-stone-700/50 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-stone-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-stone-300 uppercase tracking-wider">
            Mis Campos
          </h2>
          <span className="text-xs text-stone-500 bg-stone-800 px-2 py-0.5 rounded">
            {campos.length}
          </span>
        </div>
        {campos.length === 0 && !loading && (
          <p className="text-xs text-stone-500 mt-2">
            Dibuja un poligono en el mapa para agregar un campo.
          </p>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-20 bg-stone-800/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : (
          campos.map((campo) => <CampoCard key={campo.id} campo={campo} />)
        )}
      </div>

      {/* Footer - pricing */}
      {campos.length > 0 && (
        <div className="p-4 border-t border-stone-700/50 bg-stone-800/30">
          <div className="flex justify-between text-xs text-stone-400">
            <span>Total</span>
            <span className="font-[family-name:var(--font-geist-mono)]">
              {totalHa.toFixed(0)} ha
            </span>
          </div>
          <div className="flex justify-between items-baseline mt-1">
            <span className="text-xs text-emerald-400 font-medium">
              Plan {tier.label}
            </span>
            <span className="text-sm font-semibold text-stone-200 font-[family-name:var(--font-geist-mono)]">
              {tier.price ? `USD ${tier.price}/mes` : "A medida"}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
