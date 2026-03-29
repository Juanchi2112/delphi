"use client";

import { useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import type { ScoreItem, MonitoringScoreItem, AlertsResponse } from "@/lib/types";
import { useMapStore } from "@/stores/useMapStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCamposStore } from "@/stores/useCamposStore";
import { supabase } from "@/lib/supabase";
import MapFilters from "./MapFilters";
import AlertsBanner from "./AlertsBanner";
import LocalidadPanel from "./LocalidadPanel";
import CamposDrawer from "./CamposDrawer";
import OnboardingTourProvider from "../onboarding/OnboardingTourProvider";

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
  const authLoading = useAuthStore((s) => s.loading);
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
      <div data-onboarding="map-filters" className="shrink-0 z-[1000] bg-stone-950 border-b border-stone-800/50">
        <MapFilters seasons={seasons} />
        {mode === "monitoreo" && <AlertsBanner alerts={alerts} />}
      </div>

      {/* Map */}
      <div data-onboarding="map-markers" className="flex-1 min-h-0 relative">
        <ArgentinaMap
          items={items}
          monitoringItems={monitoringItems}
          enableDrawing={!!user}
        />

        {/* Demo banner — invite to login for full features */}
        {!user && !authLoading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000]">
            <Link
              href="/login"
              className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-stone-950/90 backdrop-blur-md px-5 py-3 shadow-lg shadow-emerald-500/5 hover:border-emerald-500/50 transition-all group"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-sm text-stone-300 group-hover:text-stone-100 transition-colors">
                <span className="text-emerald-400 font-medium">Registrate gratis</span>
                {" — "}Marca tus campos, analiza el riesgo y genera informes con IA
              </span>
            </Link>
          </div>
        )}

        {/* Campos drawer — left side, only when authenticated */}
        {user && <CamposDrawer monitoringItems={monitoringItems} />}

        {/* Detail panel — right side */}
        <LocalidadPanel />
      </div>

      {/* Onboarding tour */}
      {user && <OnboardingTourProvider items={items} />}
    </section>
  );
}
