import { isEmptyDraftValue, type IAppliedDraft, type IDraftCurrent, type TDraftField } from './applyOpportunityDraft';

export type TDraftMark = 'suggested' | 'missing';
export type TDraftMarks = Readonly<Partial<Record<TDraftField, TDraftMark>>>;

const same = (a: unknown, b: unknown): boolean => (Array.isArray(a) && Array.isArray(b) ? a.join('\u0000') === b.join('\u0000') : a === b);

/**
 * Marcas derivadas del último borrador y del valor ACTUAL del formulario:
 * «sugerido» solo mientras el campo conserve el valor aplicado; «por completar» solo mientras siga vacío.
 */
export function deriveDraftMarks(result: IAppliedDraft | undefined, current: IDraftCurrent): TDraftMarks {
  if (!result) return {};
  const marks: Partial<Record<TDraftField, TDraftMark>> = {};
  for (const field of result.applied) if (same(current[field], result.patch[field])) marks[field] = 'suggested';
  for (const field of result.missing) if (isEmptyDraftValue(current[field])) marks[field] = 'missing';
  return marks;
}
