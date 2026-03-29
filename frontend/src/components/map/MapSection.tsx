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
    <section id="mapa" className="relative h-[85vh] bg-stone-950">
      {/* Filters bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] glass-subtle">
        <MapFilters seasons={seasons} />
      </div>

      {/* Map */}
      <div className="h-full w-full pt-0">
        <ArgentinaMap items={items} />
      </div>

      {/* Legend */}
      <MapLegend />

      {/* Detail panel */}
      <LocalidadPanel />
    </section>
  );
}
