export const PROCESS_LIST_QUERY_KEY = 'process-list';
export const PROCESS_LIST_SKELETON_ROWS = 6;
export const ACTIVE_PROCESSES_LIMIT = 5;
export const PROCESS_TOTAL_PARAMS = { limit: 1 } as const;
export const PROCESS_PAGE_LIMIT_MIN = 1;
export const PROCESS_PAGE_LIMIT_MAX = 50;
export const NOT_FOUND_STATUS = 404;

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
  detailLinkLabel:   'Ver detalle',
  activeTitle:       'Procesos activos',
  activeEmpty:       'Aún no hay procesos.',
  createFirst:       'Crear el primero',
  seeAll:            'Ver todos',
  counterLoading:    '…',
  counterError:      '—',
} as const;

export const formatCandidateCount = (count: number, max: number): string => `${count} de ${max}`;

export const formatProcessSubtitle = (p: { readonly clientName: string; readonly candidateCount: number; readonly maxCandidates: number }): string =>
  `${p.clientName} · ${formatCandidateCount(p.candidateCount, p.maxCandidates)} candidatos`;
