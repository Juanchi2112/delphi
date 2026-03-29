import { create } from "zustand";
import type { RiskLevel } from "@/lib/types";

export interface Campo {
  id: string;
  nombre: string;
  geojson: GeoJSON.Polygon;
  hectareas: number;
  localidad_id: string | null;
  risk_score: number | null;
  risk_level: RiskLevel | null;
  created_at?: string;
}

interface CamposState {
  campos: Campo[];
  selectedCampoId: string | null;
  loading: boolean;
  setCampos: (campos: Campo[]) => void;
  addCampo: (campo: Campo) => void;
  removeCampo: (id: string) => void;
  selectCampo: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useCamposStore = create<CamposState>((set) => ({
  campos: [],
  selectedCampoId: null,
  loading: true,
  setCampos: (campos) => set({ campos, loading: false }),
  addCampo: (campo) =>
    set((s) => ({ campos: [campo, ...s.campos] })),
  removeCampo: (id) =>
    set((s) => ({
      campos: s.campos.filter((c) => c.id !== id),
      selectedCampoId: s.selectedCampoId === id ? null : s.selectedCampoId,
    })),
  selectCampo: (id) => set({ selectedCampoId: id }),
  setLoading: (loading) => set({ loading }),
}));
