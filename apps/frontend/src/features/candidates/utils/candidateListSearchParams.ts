import { z } from 'zod';
import { CANDIDATE_ASSIGNMENT_VALUES, CANDIDATE_PAGE_LIMIT_MAX, CANDIDATE_PAGE_LIMIT_MIN } from '../config/candidateList.constants';
import type { ICandidateListParams } from '../types/candidateList.types';

const intParam = (min: number, max: number): z.ZodNumber => z.coerce.number().int().min(min).max(max);
const assignmentSchema = z.enum(CANDIDATE_ASSIGNMENT_VALUES);

/** Parsea page/limit/assignment de la URL descartando (sin lanzar) lo inválido. */
export function parseCandidateListParams(params: URLSearchParams): ICandidateListParams {
  const rawPage = params.get('page');
  const rawLimit = params.get('limit');
  const page = rawPage ? intParam(1, Number.MAX_SAFE_INTEGER).safeParse(rawPage) : undefined;
  const limit = rawLimit ? intParam(CANDIDATE_PAGE_LIMIT_MIN, CANDIDATE_PAGE_LIMIT_MAX).safeParse(rawLimit) : undefined;
  const assignment = assignmentSchema.safeParse(params.get('assignment'));
  return {
    ...(page?.success && { page: page.data }),
    ...(limit?.success && { limit: limit.data }),
    ...(assignment.success && { assignment: assignment.data }),
  };
}

/** Reescribe page/limit/assignment conservando los params ajenos; la página 1 no se escribe. */
export function applyCandidateListParams(prev: URLSearchParams, values: ICandidateListParams): URLSearchParams {
  const next = new URLSearchParams(prev);
  ['page', 'limit', 'assignment'].forEach(key => next.delete(key));
  if (values.page && values.page > 1) next.set('page', String(values.page));
  if (values.limit) next.set('limit', String(values.limit));
  if (values.assignment) next.set('assignment', values.assignment);
  return next;
}
