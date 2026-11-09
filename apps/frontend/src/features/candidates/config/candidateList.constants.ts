import type { TCandidateAssignment } from '@ibm-talent-bridge/shared-types';

export const CANDIDATE_LIST_QUERY_KEY = 'candidate-list';
export const CANDIDATE_LIST_SKELETON_ROWS = 6;
export const CANDIDATE_PAGE_LIMIT_MIN = 1;
export const CANDIDATE_PAGE_LIMIT_MAX = 50;
export const CANDIDATE_ASSIGNMENT_VALUES = ['available', 'assigned'] as const satisfies readonly TCandidateAssignment[];

export const CANDIDATE_COLUMNS: readonly string[] = ['Nombre', 'Rol', 'Correo', 'Estado', 'Creado'];

export const CANDIDATE_LIST_COPY = {
  title:          'Candidatos',
  addCandidate:   '+ Agregar candidato',
  errorMessage:   'No se pudieron cargar los candidatos.',
  retryLabel:     'Reintentar',
  loadingLabel:   'Cargando candidatos',
  noRole:         '—',
  available:      'Disponible',
  inProcess:      'En una oportunidad',
  filterLabel:    'Filtrar candidatos',
} as const;

export interface ICandidateFilterOption {
  readonly value: TCandidateAssignment | undefined;
  readonly label: string;
  readonly empty: string;
}

export const CANDIDATE_FILTERS: readonly ICandidateFilterOption[] = [
  { value: undefined,   label: 'Todos',         empty: 'Aún no hay candidatos' },
  { value: 'available', label: 'Disponibles',   empty: 'No hay candidatos disponibles' },
  { value: 'assigned',  label: 'En una oportunidad', empty: 'Ningún candidato está en una oportunidad' },
];

/** Etiqueta del enlace de salida de «Candidato creado». */
export const CANDIDATE_EXIT_LINKS = {
  list:       { label: 'Ver candidatos' },
} as const;
