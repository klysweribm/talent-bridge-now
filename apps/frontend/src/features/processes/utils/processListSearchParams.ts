import { z } from 'zod';
import { PROCESS_PAGE_LIMIT_MAX, PROCESS_PAGE_LIMIT_MIN, PROCESS_SEARCH_MAX_LENGTH } from '../config/processList.constants';
import type { IProcessListParams } from '../types/processList.types';

const intParam = (min: number, max: number): z.ZodNumber => z.coerce.number().int().min(min).max(max);

/** Recorta espacios y el largo máximo; vacío → undefined (sin filtro). */
export function normalizeQuery(raw: string | null | undefined): string | undefined {
  const q = (raw ?? '').trim().slice(0, PROCESS_SEARCH_MAX_LENGTH).trim();
  return q || undefined;
}

/** Parsea page/limit/q de la URL descartando (sin lanzar) lo inválido. */
export function parseProcessListParams(params: URLSearchParams): IProcessListParams {
  const rawPage = params.get('page');
  const rawLimit = params.get('limit');
  const page = rawPage ? intParam(1, Number.MAX_SAFE_INTEGER).safeParse(rawPage) : undefined;
  const limit = rawLimit ? intParam(PROCESS_PAGE_LIMIT_MIN, PROCESS_PAGE_LIMIT_MAX).safeParse(rawLimit) : undefined;
  const q = normalizeQuery(params.get('q'));
  return {
    ...(page?.success && { page: page.data }),
    ...(limit?.success && { limit: limit.data }),
    ...(q && { q }),
  };
}

/** Reescribe page/limit/q conservando los params ajenos; la página 1 no se escribe. */
export function applyProcessListParams(prev: URLSearchParams, values: IProcessListParams): URLSearchParams {
  const next = new URLSearchParams(prev);
  next.delete('page');
  next.delete('limit');
  next.delete('q');
  if (values.page && values.page > 1) next.set('page', String(values.page));
  if (values.limit) next.set('limit', String(values.limit));
  const q = normalizeQuery(values.q);
  if (q) next.set('q', q);
  return next;
}
