import { z } from 'zod';
import { PROCESS_PAGE_LIMIT_MAX, PROCESS_PAGE_LIMIT_MIN } from '../config/processList.constants';
import type { IProcessListParams } from '../types/processList.types';

const intParam = (min: number, max: number): z.ZodNumber => z.coerce.number().int().min(min).max(max);

/** Parsea page/limit de la URL descartando (sin lanzar) lo inválido. */
export function parseProcessListParams(params: URLSearchParams): IProcessListParams {
  const rawPage = params.get('page');
  const rawLimit = params.get('limit');
  const page = rawPage ? intParam(1, Number.MAX_SAFE_INTEGER).safeParse(rawPage) : undefined;
  const limit = rawLimit ? intParam(PROCESS_PAGE_LIMIT_MIN, PROCESS_PAGE_LIMIT_MAX).safeParse(rawLimit) : undefined;
  return {
    ...(page?.success && { page: page.data }),
    ...(limit?.success && { limit: limit.data }),
  };
}

/** Reescribe page/limit conservando los params ajenos; la página 1 no se escribe. */
export function applyProcessListParams(prev: URLSearchParams, values: IProcessListParams): URLSearchParams {
  const next = new URLSearchParams(prev);
  next.delete('page');
  next.delete('limit');
  if (values.page && values.page > 1) next.set('page', String(values.page));
  if (values.limit) next.set('limit', String(values.limit));
  return next;
}
