"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/stores/useAuthStore";
import { useCamposStore } from "@/stores/useCamposStore";
import { supabase } from "@/lib/supabase";
import type { ScoreItem, MonitoringScoreItem, AlertsResponse } from "@/lib/types";
import CamposSidebar from "./CamposSidebar";
import Navbar from "@/components/layout/Navbar";

const DashboardMap = dynamic(() => import("./DashboardMap"), { ssr: false });

interface Props {
  items: ScoreItem[];
  seasons: string[];
  monitoringItems?: MonitoringScoreItem[];
  alerts?: AlertsResponse | null;
}

export default function DashboardClient({ items, seasons, monitoringItems = [], alerts = null }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const { setCampos, setLoading } = useCamposStore();

  // Build a lookup map: localidad_key → MonitoringScoreItem
  const monitoringMap = useMemo(() => {
    const map = new Map<string, MonitoringScoreItem>();
    for (const item of monitoringItems) {
      map.set(item.localidad_key, item);
    }
    return map;
  }, [monitoringItems]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from("campos")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setCampos(data ?? []);
      });
  }, [user, setCampos, setLoading]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#0C0A09] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0A09] flex flex-col">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <CamposSidebar monitoringMap={monitoringMap} />
        <div className="flex-1 relative">
          <DashboardMap items={items} seasons={seasons} monitoringItems={monitoringItems} />
        </div>
      </div>
    </div>
  );
}
