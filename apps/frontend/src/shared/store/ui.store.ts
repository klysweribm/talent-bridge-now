import { create } from 'zustand';

/**
 * UI Store — estado de preferencias de interfaz.
 * SOLO estado cliente puro: nunca datos de servidor aquí.
 * - sidebarCollapsed: sidebar expandido/colapsado (default: false = expandido)
 */

interface UiState {
  readonly sidebarCollapsed: boolean;
}

interface UiActions {
  toggleSidebarCollapsed: () => void;
}

export const useUiStore = create<UiState & UiActions>()((set) => ({
  sidebarCollapsed: false,

  toggleSidebarCollapsed: () =>
    set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
