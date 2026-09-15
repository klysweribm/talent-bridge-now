// Store (Zustand) — máx 50 líneas. Solo estado de CLIENTE: nunca datos que
// vienen de un GET (eso es React Query, ver hook.example.ts). Un store
// pequeño por dominio de cliente, no un store global.
// Referencia real que ya cumple esto: apps/frontend/src/features/auth/store/auth.store.ts

import { create } from 'zustand';

interface WizardState {
  readonly activeStep: number;
  readonly totalSteps: number;
}

interface WizardActions {
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const INITIAL_STATE: WizardState = {
  activeStep: 1,
  totalSteps: 4,
} as const;

export const useWizardStore = create<WizardState & WizardActions>()((set) => ({
  ...INITIAL_STATE,

  goToStep: (step) =>
    set((state) => ({ activeStep: Math.min(Math.max(step, 1), state.totalSteps) })),

  nextStep: () =>
    set((state) => ({ activeStep: Math.min(state.activeStep + 1, state.totalSteps) })),

  prevStep: () =>
    set((state) => ({ activeStep: Math.max(state.activeStep - 1, 1) })),
}));
