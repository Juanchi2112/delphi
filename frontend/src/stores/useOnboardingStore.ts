import { create } from "zustand";

export interface OnboardingStep {
  target: string;
  title: string;
  description: string;
  placement: "top" | "bottom" | "left" | "right";
  querySelector?: string;
  simulateAction?: string;
  /** Fixed tooltip position as viewport percentages [leftPercent, topPercent] */
  fixedPosition?: [number, number];
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    target: "map-filters",
    title: "Filtros del mapa",
    description:
      "Alterna entre Pre-campaña y Monitoreo, filtrá por región y nivel de riesgo.",
    placement: "bottom",
  },
  {
    target: "map-markers",
    title: "Localidades",
    description:
      "Cada punto representa una localidad. El color indica el nivel de riesgo. Hacé click para ver detalles.",
    placement: "bottom",
    fixedPosition: [8, 45],
  },
  {
    target: "localidad-panel",
    title: "Panel de detalle",
    description:
      "Al hacer click en un punto se abre este panel con el score de riesgo, variables clave e historial de la localidad.",
    placement: "left",
    simulateAction: "select-localidad",
    fixedPosition: [38, 40],
  },
  {
    target: "campos-drawer-button",
    title: "Mis Campos",
    description:
      "Accedé a tu lista de campos guardados y gestioná tu cartera desde acá.",
    placement: "right",
  },
  {
    target: "onboarding-drawer",
    title: "Dibujar campo",
    description:
      "Dibujá un polígono sobre el mapa para delimitar tu campo. Se calcula el área y la localidad más cercana automáticamente.",
    placement: "right",
    simulateAction: "simulate-draw",
    fixedPosition: [40, 40],
  },
];

const STORAGE_KEY = "delphi_onboarding_map_done";

function isCompleted(): boolean {
  try {
    return typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

function markCompleted() {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch {
    // localStorage unavailable
  }
}

interface OnboardingState {
  active: boolean;
  currentStep: number;
  completed: boolean;
  start: () => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  complete: () => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  active: false,
  currentStep: 0,
  completed: isCompleted(),

  start: () => {
    if (!get().completed) {
      set({ active: true, currentStep: 0 });
    }
  },

  next: () => {
    const { currentStep } = get();
    if (currentStep >= ONBOARDING_STEPS.length - 1) {
      get().complete();
    } else {
      set({ currentStep: currentStep + 1 });
    }
  },

  prev: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },

  skip: () => {
    markCompleted();
    set({ active: false, completed: true });
  },

  complete: () => {
    markCompleted();
    set({ active: false, completed: true });
  },

  reset: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    set({ active: false, currentStep: 0, completed: false });
  },
}));
