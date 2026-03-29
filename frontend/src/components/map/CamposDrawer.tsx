"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Map, X } from "lucide-react";
import { useCamposStore, type Campo } from "@/stores/useCamposStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { supabase } from "@/lib/supabase";
import { extractLocalidadKey } from "@/lib/utils";
import type { RiskLevel, MonitoringScoreItem } from "@/lib/types";
import CampoCard from "@/components/dashboard/CampoCard";
import CampoDetail from "@/components/dashboard/CampoDetail";
import RiskBadge from "@/components/detail/RiskBadge";

const PRICE_TIERS = [
  { max: 800, label: "Starter", price: "USD 2K" },
  { max: 3000, label: "Pro", price: "USD 6K" },
  { max: Infinity, label: "Enterprise", price: "Custom" },
];

function getTier(hectareas: number) {
  return PRICE_TIERS.find((t) => hectareas <= t.max) ?? PRICE_TIERS[2];
}

function NewCampoForm() {
  const { pendingCampo, setPendingCampo, addCampo } = useCamposStore();
  const user = useAuthStore((s) => s.user);
  const [nombre, setNombre] = useState("");
  const [saving, setSaving] = useState(false);

  if (!pendingCampo) return null;

  const handleSave = async () => {
    if (!user || !nombre.trim()) return;
    setSaving(true);

    const campoData = {
      user_id: user.id,
      nombre: nombre.trim(),
      geojson: pendingCampo.geojson,
      hectareas: pendingCampo.hectareas,
      localidad_id: pendingCampo.nearest.id,
      risk_score: pendingCampo.nearest.risk_score,
      risk_level: pendingCampo.nearest.risk_level,
    };

    const { data, error } = await supabase
      .from("campos")
      .insert(campoData)
      .select()
      .single();

    setSaving(false);
    if (data && !error) {
      addCampo(data as Campo);
      setNombre("");
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-200">Nuevo Campo</h3>
        <button
          onClick={() => setPendingCampo(null)}
          className="text-xs text-stone-500 hover:text-stone-300 cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-stone-800/50 rounded-lg p-3">
          <p className="text-[10px] text-stone-500 uppercase">Hectareas</p>
          <p className="text-lg font-semibold text-stone-200 font-[family-name:var(--font-geist-mono)]">
            {pendingCampo.hectareas.toFixed(0)}
          </p>
        </div>
        <div className="bg-stone-800/50 rounded-lg p-3">
          <p className="text-[10px] text-stone-500 uppercase">Riesgo</p>
          <div className="flex items-center gap-2 mt-1">
            <RiskBadge level={pendingCampo.nearest.risk_level as RiskLevel} />
          </div>
        </div>
      </div>

      <p className="text-xs text-stone-500">
        Localidad ref: {pendingCampo.nearest.localidad},{" "}
        {pendingCampo.nearest.provincia}
      </p>

      <div>
        <label className="block text-xs font-medium text-stone-400 mb-1.5">
          Nombre del campo
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Lote 5 Norte"
          autoFocus
          className="w-full px-3 py-2.5 bg-stone-800/50 border border-stone-700 rounded-lg text-sm text-stone-50 placeholder-stone-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-colors"
          onKeyDown={(e) => {
            if (e.key === "Enter" && nombre.trim()) handleSave();
          }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!nombre.trim() || saving}
        className="w-full py-2.5 bg-emerald-500 text-stone-950 font-semibold rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
      >
        {saving ? "Guardando..." : "Guardar campo"}
      </button>
    </div>
  );
}

export default function CamposDrawer({
  monitoringItems = [],
}: {
  monitoringItems?: MonitoringScoreItem[];
}) {
  const {
    campos,
    loading,
    pendingCampo,
    selectedCampoId,
    drawerOpen,
    toggleDrawer,
  } = useCamposStore();

  const totalHa = campos.reduce((sum, c) => sum + c.hectareas, 0);
  const tier = getTier(totalHa);

  const monitoringMap = useMemo(() => {
    const lookup: Record<string, MonitoringScoreItem> = {};
    for (const item of monitoringItems) {
      lookup[item.localidad_key] = item;
    }
    return lookup;
  }, [monitoringItems]);

  const selectedCampo = selectedCampoId
    ? campos.find((c) => c.id === selectedCampoId)
    : null;

  // Determine drawer content
  let drawerContent: React.ReactNode;
  if (pendingCampo) {
    drawerContent = <NewCampoForm />;
  } else if (selectedCampo) {
    drawerContent = <CampoDetail campo={selectedCampo} />;
  } else {
    drawerContent = (
      <>
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
            campos.map((campo) => {
              const monData =
                campo.localidad_id
                  ? monitoringMap[extractLocalidadKey(campo.localidad_id)]
                  : undefined;
              return (
                <CampoCard
                  key={campo.id}
                  campo={campo}
                  monitoring={monData}
                />
              );
            })
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
                {tier.price}/temporada
              </span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        data-onboarding="campos-drawer-button"
        onClick={toggleDrawer}
        className="absolute bottom-20 left-4 z-[1001] flex items-center gap-2 px-3 py-2 bg-emerald-500/90 hover:bg-emerald-400 text-stone-950 font-medium text-sm rounded-lg shadow-lg transition-colors cursor-pointer backdrop-blur-sm"
      >
        <Map size={16} />
        <span>Mis Campos</span>
        {campos.length > 0 && (
          <span className="bg-stone-900/50 text-emerald-100 text-xs px-1.5 py-0.5 rounded">
            {campos.length}
          </span>
        )}
      </button>

      {/* Drawer panel */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.aside
            data-onboarding="onboarding-drawer"
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="absolute left-0 top-0 bottom-0 w-[320px] bg-stone-900/95 backdrop-blur-xl border-r border-stone-700 z-[1001] flex flex-col overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={toggleDrawer}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center text-stone-400 hover:text-stone-200 transition-colors z-10 cursor-pointer"
            >
              <X size={14} />
            </button>

            <div className="flex flex-col flex-1 min-h-0">
              {drawerContent}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
