import { create } from 'zustand';

/**
 * UI Store — estado de preferencias de interfaz.
 * SOLO estado cliente puro: nunca datos de servidor aquí.
 * - collapsed: sidebar expandido/colapsado (default: false = expandido)
 * - darkSidebar: tema del sidebar (false = blanco, true = azul IBM)
 */

interface UiState {
  readonly sidebarCollapsed: boolean;
  readonly sidebarDark:      boolean;
}

interface UiActions {
  toggleSidebarCollapsed: () => void;
  toggleSidebarTheme:     () => void;
}

export const useUiStore = create<UiState & UiActions>()((set) => ({
  sidebarCollapsed: false,   // por defecto: expandido
  sidebarDark:      false,   // por defecto: fondo blanco

  toggleSidebarCollapsed: () =>
    set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  toggleSidebarTheme: () =>
    set(state => ({ sidebarDark: !state.sidebarDark })),
}));
