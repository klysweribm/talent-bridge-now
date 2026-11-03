export const PROCESS_LIST_QUERY_KEY = 'process-list';
export const PROCESS_LIST_SKELETON_ROWS = 6;
export const ACTIVE_PROCESSES_LIMIT = 5;
export const PROCESS_TOTAL_PARAMS = { limit: 1 } as const;
export const PROCESS_PAGE_LIMIT_MIN = 1;
export const PROCESS_PAGE_LIMIT_MAX = 50;
export const NOT_FOUND_STATUS = 404;
export const PROCESS_SEARCH_DEBOUNCE_MS = 300;
export const PROCESS_SEARCH_MAX_LENGTH = 100;
export const REFERENTS_AVATAR_MAX = 3;

export const PROCESS_LIST_COPY = {
  title:             'Procesos',
  newProcess:        '+ Nuevo proceso',
  emptyMessage:      'Sin procesos abiertos',
  errorMessage:      'No se pudieron cargar los procesos.',
  retryLabel:        'Reintentar',
  loadingLabel:      'Cargando procesos',
  detailLoading:     'Cargando proceso',
  detailError:       'No se pudo cargar el proceso.',
  notFound:          'Proceso no encontrado',
  backToList:        'Volver a procesos',
  candidatesHeading: 'Candidatos',
  noCandidates:      'Este proceso aún no tiene candidatos.',
  clientLabel:       'Cliente',
  viewProcess:       'Ver proceso',
  activeTitle:       'Procesos activos',
  recentTitle:       'Procesos activos recientes',
  filterPlaceholder: 'Filtrar por rol o cliente…',
  clearFilter:       'Limpiar filtro',
  referentsLabel:    'Referentes:',
  referentsGroup:    'Referentes',
  noReferents:       'Sin referentes',
  countLabel:        'Total de procesos',
  activeEmpty:       'Aún no hay procesos.',
  createFirst:       'Crear el primero',
  counterLoading:    '…',
  counterError:      '—',
} as const;

export const formatCandidateCount = (count: number, max: number): string => `${count} de ${max}`;

export const formatProcessSubtitle = (p: { readonly clientName: string; readonly opportunityRole: string }): string =>
  p.opportunityRole ? `${p.clientName} · ${p.opportunityRole}` : p.clientName;

export const formatCandidatesLink = (count: number): string => `${count} ${count === 1 ? 'candidato' : 'candidatos'}`;
export const formatSeeAll = (total: number): string => `Ver todos los procesos (${total})`;
export const formatNoResults = (q: string): string => `Sin resultados para “${q}”`;
