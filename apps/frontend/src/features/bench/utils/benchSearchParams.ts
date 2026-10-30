import { z } from 'zod';
import { BENCH_PAGE_LIMIT_MAX, BENCH_PAGE_LIMIT_MIN, SENIORITY_VALUES } from '../config/bench.constants';
import type { IBenchFilters } from '../types/bench.types';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const isRealDate = (value: string): boolean => {
  const parsed = new Date(`${value}T00:00:00Z`);
  return DATE_RE.test(value) && !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
};

const intParam = (min: number, max: number): z.ZodNumber => z.coerce.number().int().min(min).max(max);

const dateSchema = z.string().refine(isRealDate);
const countSchema = z.string().min(1);
const seniorityItem = z.enum(SENIORITY_VALUES);

/** Lee todos los valores (repetidos o separados por coma) de un param. */
function readList(params: URLSearchParams, key: string): string[] {
  return params.getAll(key).flatMap(raw => raw.split(',')).map(v => v.trim()).filter(Boolean);
}

/** Parsea los params de la URL descartando (no lanzando) los valores inválidos. */
export function parseBenchParams(params: URLSearchParams): IBenchFilters {
  const availableBy = dateSchema.safeParse(params.get('availableBy'));
  const country = countSchema.safeParse(params.get('country'));
  const page = intParam(1, Number.MAX_SAFE_INTEGER).safeParse(params.get('page'));
  const limit = intParam(BENCH_PAGE_LIMIT_MIN, BENCH_PAGE_LIMIT_MAX).safeParse(params.get('limit'));

  return {
    skills: readList(params, 'skills'),
    seniority: readList(params, 'seniority').flatMap(v => {
      const parsed = seniorityItem.safeParse(v);
      return parsed.success ? [parsed.data] : [];
    }),
    ...(availableBy.success && { availableBy: availableBy.data }),
    ...(country.success && { country: country.data }),
    ...(page.success && { page: page.data }),
    ...(limit.success && { limit: limit.data }),
  };
}

/** Reescribe TODOS los params de filtro (lo no informado se borra, incl. page); conserva el resto y conserva el resto (p. ej. `resource`). */
export function applyBenchFilters(prev: URLSearchParams, filters: Partial<IBenchFilters>): URLSearchParams {
  const next = new URLSearchParams(prev);
  ['skills', 'seniority', 'availableBy', 'country', 'page', 'limit'].forEach(key => next.delete(key));
  (filters.skills ?? []).forEach(v => next.append('skills', v));
  (filters.seniority ?? []).forEach(v => next.append('seniority', v));
  if (filters.availableBy) next.set('availableBy', filters.availableBy);
  if (filters.country) next.set('country', filters.country);
  if (filters.page && filters.page > 1) next.set('page', String(filters.page));
  if (filters.limit) next.set('limit', String(filters.limit));
  return next;
}
