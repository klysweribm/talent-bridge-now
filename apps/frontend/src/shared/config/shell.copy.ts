/** shell.copy — textos del shell (header, paneles de búsqueda y notificaciones). */
export const SHELL_COPY = {
  searchLabel:        'Buscar',
  searchPanelLabel:   'Búsqueda global',
  searchPlaceholder:  'Buscar recursos, oportunidades o candidatos',
  searchInputLabel:   'Texto a buscar',
  searchEmpty:        'Escribe un nombre, rol, skill, cliente o correo.',
  searchLoading:      'Buscando…',
  searchClose:        'Cerrar búsqueda',
  benchGroupTitle:    'Recursos en banca',
  notificationsLabel: 'Notificaciones',
  markAllRead:        'Marcar todas como leídas',
  noNotifications:    'No tienes notificaciones.',
  userMenuFallback:   'Usuario',
} as const;

export const searchNoResults = (query: string): string => `Sin resultados para "${query}".`;
export const unreadLabel = (count: number): string =>
  count > 0 ? `${SHELL_COPY.notificationsLabel} (${count} sin leer)` : SHELL_COPY.notificationsLabel;

/** Ids de los paneles: enlazan `aria-controls` del header con el panel. */
export const SEARCH_PANEL_ID = 'global-search-panel';
export const NOTIFICATIONS_PANEL_ID = 'notifications-panel';
