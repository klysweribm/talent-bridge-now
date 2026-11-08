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
  title:             'Oportunidades',
  newProcess:        '+ Nueva oportunidad',
  emptyMessage:      'Sin oportunidades abiertas',
  errorMessage:      'No se pudieron cargar las oportunidades.',
  retryLabel:        'Reintentar',
  loadingLabel:      'Cargando oportunidades',
  detailLoading:     'Cargando oportunidad',
  detailError:       'No se pudo cargar la oportunidad.',
  notFound:          'Oportunidad no encontrada',
  backToList:        'Volver a oportunidades',
  candidatesHeading: 'Candidatos',
  noCandidates:      'Esta oportunidad aún no tiene candidatos.',
  clientLabel:       'Cliente',
  viewProcess:       'Ver oportunidad',
  activeTitle:       'Oportunidades activas',
  recentTitle:       'Oportunidades activas recientes',
  filterPlaceholder: 'Filtrar por rol o cliente…',
  clearFilter:       'Limpiar filtro',
  referentsLabel:    'Referentes:',
  referentsGroup:    'Referentes',
  noReferents:       'Sin referentes',
  countLabel:        'Total de oportunidades',
  activeEmpty:       'Aún no hay oportunidades.',
  createFirst:       'Crear el primero',
  counterLoading:    '…',
  counterError:      '—',
} as const;

export const formatCandidateCount = (count: number, max: number): string => `${count} de ${max}`;

export const formatProcessSubtitle = (p: { readonly clientName: string; readonly opportunityRole: string }): string =>
  p.opportunityRole ? `${p.clientName} · ${p.opportunityRole}` : p.clientName;

export const formatCandidatesLink = (count: number): string => `${count} ${count === 1 ? 'candidato' : 'candidatos'}`;
export const formatSeeAll = (total: number): string => `Ver todas las oportunidades (${total})`;
export const formatNoResults = (q: string): string => `Sin resultados para “${q}”`;
