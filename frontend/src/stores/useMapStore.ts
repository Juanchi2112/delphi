import { create } from "zustand";
import type { RiskLevel, AlertCategory } from "@/lib/types";

export type MapMode = "precampana" | "monitoreo";

interface MapState {
  mode: MapMode;
  temporada: string;
  region: string | null;
  riskLevel: RiskLevel | null;
  alertCategory: AlertCategory | null;
  selectedId: string | null;
  setMode: (m: MapMode) => void;
  setTemporada: (t: string) => void;
  setRegion: (r: string | null) => void;
  setRiskLevel: (l: RiskLevel | null) => void;
  setAlertCategory: (c: AlertCategory | null) => void;
  selectLocalidad: (id: string | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  mode: "precampana",
  temporada: "2025-2026",
  region: null,
  riskLevel: null,
  alertCategory: null,
  selectedId: null,
  setMode: (mode) => set({ mode, selectedId: null, alertCategory: null }),
  setTemporada: (temporada) => set({ temporada, selectedId: null }),
  setRegion: (region) => set({ region, selectedId: null }),
  setRiskLevel: (riskLevel) => set({ riskLevel }),
  setAlertCategory: (alertCategory) => set({ alertCategory }),
  selectLocalidad: (selectedId) => set({ selectedId }),
}));
