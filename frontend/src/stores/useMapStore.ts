import { create } from "zustand";
import type { RiskLevel } from "@/lib/types";

interface MapState {
  temporada: string;
  region: string | null;
  riskLevel: RiskLevel | null;
  selectedId: string | null;
  setTemporada: (t: string) => void;
  setRegion: (r: string | null) => void;
  setRiskLevel: (l: RiskLevel | null) => void;
  selectLocalidad: (id: string | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
  temporada: "2025-2026",
  region: null,
  riskLevel: null,
  selectedId: null,
  setTemporada: (temporada) => set({ temporada, selectedId: null }),
  setRegion: (region) => set({ region, selectedId: null }),
  setRiskLevel: (riskLevel) => set({ riskLevel }),
  selectLocalidad: (selectedId) => set({ selectedId }),
}));
