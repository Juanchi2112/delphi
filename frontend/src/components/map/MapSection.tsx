"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import type { ScoreItem, MonitoringScoreItem, AlertsResponse } from "@/lib/types";
import { useMapStore } from "@/stores/useMapStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCamposStore } from "@/stores/useCamposStore";
import { supabase } from "@/lib/supabase";
import MapFilters from "./MapFilters";
import MapLegend from "./MapLegend";
import AlertsBanner from "./AlertsBanner";
import LocalidadPanel from "./LocalidadPanel";
import CamposDrawer from "./CamposDrawer";

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
  monitoringItems = [],
  alerts = null,
  seasons,
}: {
  items: ScoreItem[];
  monitoringItems?: MonitoringScoreItem[];
  alerts?: AlertsResponse | null;
  seasons: string[];
}) {
  const mode = useMapStore((s) => s.mode);
  const user = useAuthStore((s) => s.user);
  const { setCampos, setLoading } = useCamposStore();

  useEffect(() => {
    if (!user) {
      setCampos([]);
      return;
    }
    setLoading(true);
    supabase
      .from("campos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCampos(data ?? []);
      });
  }, [user, setCampos, setLoading]);

  return (
    <section id="mapa" className="relative h-[85vh] bg-stone-950 flex flex-col rounded-2xl mx-4 md:mx-8 shadow-[0_0_160px_rgba(0,0,0,0.9),0_0_400px_rgba(0,0,0,0.6),0_0_600px_rgba(0,0,0,0.4)] border border-stone-800/40 overflow-hidden">
      {/* Filters bar */}
      <div className="shrink-0 z-[1000] bg-stone-950 border-b border-stone-800/50">
        <MapFilters seasons={seasons} />
        {mode === "monitoreo" && <AlertsBanner alerts={alerts} />}
      </div>

      {/* Map */}
      <div className="flex-1 min-h-0 relative">
        <ArgentinaMap
          items={items}
          monitoringItems={monitoringItems}
          enableDrawing={!!user}
        />

        {/* Campos drawer — left side, only when authenticated */}
        {user && <CamposDrawer monitoringItems={monitoringItems} />}

        {/* Legend */}
        <MapLegend />

        {/* Detail panel — right side */}
        <LocalidadPanel />
      </div>
    </section>
  );
}
