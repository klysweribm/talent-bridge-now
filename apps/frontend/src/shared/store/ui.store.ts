import { create } from 'zustand';

/**
 * UI Store — estado de interfaz del shell. SOLO estado cliente puro.
 * - activePanel: panel flotante del header abierto (búsqueda o notificaciones), uno a la vez.
 */
export type TShellPanel = 'search' | 'notifications';

interface UiState {
  readonly activePanel: TShellPanel | null;
}

interface UiActions {
  togglePanel: (panel: TShellPanel) => void;
  closePanel:  () => void;
}

export const useUiStore = create<UiState & UiActions>()((set) => ({
  activePanel: null,

  togglePanel: (panel) =>
    set(state => ({ activePanel: state.activePanel === panel ? null : panel })),

  closePanel: () => set({ activePanel: null }),
}));
