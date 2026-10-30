import type { TBenchStatus, TLanguageProficiency, TSeniority, TSkillLevelValue } from '@ibm-talent-bridge/shared-types';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;
export const MAX_SKILLS_FILTER = 10;

export const DEFAULT_STATUSES: readonly TBenchStatus[] = ['available', 'soft_booked'];

// Arrays de runtime locales: `shared-types` es solo tipos (la imagen de producción no resuelve el alias).
export const BENCH_SENIORITIES: readonly TSeniority[] = ['jr', 'ssr', 'sr', 'lead'];
export const BENCH_STATUSES: readonly TBenchStatus[] = ['available', 'soft_booked', 'assigned'];
export const SKILL_LEVEL_VALUES: readonly TSkillLevelValue[] = [1, 2, 3, 4, 5];
export const LANGUAGE_PROFICIENCIES: readonly TLanguageProficiency[] = [
  'basic',
  'intermediate',
  'advanced',
  'native',
];

/** Solo `YYYY-MM-DD` o fecha-hora completa; excluye semanas (`2026-W44`) y ordinales (`2026-305`). */
export const AVAILABLE_BY_PATTERN =
  /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2}))?$/;
