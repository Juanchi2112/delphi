"use client";

import dynamic from "next/dynamic";
import type { ScoreItem } from "@/lib/types";
import MapFilters from "./MapFilters";
import MapLegend from "./MapLegend";
import LocalidadPanel from "./LocalidadPanel";

const ArgentinaMap = dynamic(() => import("./ArgentinaMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-stone-950 flex items-center justify-center">
      <div className="text-stone-500 text-sm animate-pulse">Cargando mapa...</div>
    </div>
  ),
});

export default function MapSection({
  items,
  seasons,
}: {
  items: ScoreItem[];
  seasons: string[];
}) {
  return (
    <section id="mapa" className="relative h-[85vh] bg-stone-950 flex flex-col rounded-2xl mx-4 md:mx-8 shadow-[0_0_160px_rgba(0,0,0,0.9),0_0_400px_rgba(0,0,0,0.6),0_0_600px_rgba(0,0,0,0.4)] border border-stone-800/40 overflow-hidden">
      {/* Filters bar — static, does not overlap map */}
      <div className="shrink-0 z-[1000] bg-stone-950 border-b border-stone-800/50">
        <MapFilters seasons={seasons} />
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <ArgentinaMap items={items} />
      </div>

      {/* Legend */}
      <MapLegend />

      {/* Detail panel */}
      <LocalidadPanel />
    </section>
  );
}
