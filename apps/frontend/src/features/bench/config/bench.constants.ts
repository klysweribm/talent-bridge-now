import type { TBenchStatus, TLanguageProficiency, TSeniority } from '@ibm-talent-bridge/shared-types';

export interface IOption<T extends string> {
  readonly value: T;
  readonly label: string;
}

export const SENIORITY_OPTIONS: readonly IOption<TSeniority>[] = [
  { value: 'jr',   label: 'Jr' },
  { value: 'ssr',  label: 'Ssr' },
  { value: 'sr',   label: 'Sr' },
  { value: 'lead', label: 'Lead' },
];

export const SENIORITY_VALUES = ['jr', 'ssr', 'sr', 'lead'] as const satisfies readonly TSeniority[];

// TODO: debería venir de la API (hoy el backend no expone un endpoint de países).
export const COUNTRY_OPTIONS: readonly string[] = [
  'Argentina', 'Brasil', 'Chile', 'Colombia', 'México', 'Perú', 'Uruguay',
];

export const STATUS_LABELS: Readonly<Record<TBenchStatus, string>> = {
  available:   'Disponible',
  soft_booked: 'Reserva tentativa',
  assigned:    'Asignado',
};

export const LANGUAGE_LEVEL_LABELS: Readonly<Record<TLanguageProficiency, string>> = {
  basic:        'Básico',
  intermediate: 'Intermedio',
  advanced:     'Avanzado',
  native:       'Nativo',
};

export const BENCH_PAGE_LIMIT_MIN = 1;
export const BENCH_PAGE_LIMIT_MAX = 50;
export const TOP_SKILLS_COUNT = 3;
export const SKELETON_ROWS = 6;
export const BENCH_QUERY_KEY = 'bench';
export const SKILLS_STALE_TIME_MS = 1000 * 60 * 30;
export const RESOURCE_PARAM = 'resource';

export const CONTROL_CLASSES =
  'h-10 px-sm border border-outline-variant rounded bg-surface-card text-body-md text-text-primary';

export const BENCH_COLUMNS = [
  'Código', 'Nombre', 'Rol', 'Seniority', 'Skills principales', 'País', 'Disponible desde', 'Estado',
] as const;
