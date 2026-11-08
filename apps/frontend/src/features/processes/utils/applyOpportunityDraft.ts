import type { IOpportunityDraftFields } from '@ibm-talent-bridge/shared-types';

export type TDraftField = keyof IOpportunityDraftFields;

/** Valores actuales del formulario para los campos que la IA puede proponer (`band`/`startDate` opcionales). */
export interface IDraftCurrent {
  readonly title: string;
  readonly clientName: string;
  readonly opportunityRole: string;
  readonly skills: readonly string[];
  readonly roleDescription: string;
  readonly band?: number | undefined;
  readonly startDate?: string | undefined;
}

export type TDraftPatch = { -readonly [K in keyof IDraftCurrent]?: IDraftCurrent[K] extends readonly string[] ? string[] : IDraftCurrent[K] };

export interface IAppliedDraft {
  readonly patch: TDraftPatch;
  readonly applied: readonly TDraftField[];
  /** La IA propuso algo pero el campo ya tenía valor: no se toca. */
  readonly skipped: readonly TDraftField[];
  /** Campo vacío que la IA no pudo inferir: va «por completar». */
  readonly missing: readonly TDraftField[];
}

const FIELDS: readonly TDraftField[] = ['title', 'clientName', 'opportunityRole', 'skills', 'roleDescription', 'band', 'startDate'];

export function isEmptyDraftValue(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  return Array.isArray(value) && value.length === 0;
}

/** Solo rellena campos vacíos; `null` del borrador no aplica nada. La conversión null → ausente vive solo aquí. */
export function applyOpportunityDraft(
  draft: IOpportunityDraftFields, missingFields: readonly TDraftField[], current: IDraftCurrent,
): IAppliedDraft {
  const patch: Record<string, unknown> = {};
  const applied: TDraftField[] = [];
  const skipped: TDraftField[] = [];
  const missing: TDraftField[] = [];
  for (const field of FIELDS) {
    const proposed = draft[field];
    const filled = !isEmptyDraftValue(current[field]);
    if (isEmptyDraftValue(proposed)) {
      if (!filled) missing.push(field);
    } else if (filled) {
      skipped.push(field);
    } else {
      patch[field] = Array.isArray(proposed) ? [...(proposed as readonly string[])] : proposed;
      applied.push(field);
    }
  }
  for (const field of missingFields) {
    if (isEmptyDraftValue(current[field]) && !applied.includes(field) && !missing.includes(field)) missing.push(field);
  }
  return { patch: patch as TDraftPatch, applied, skipped, missing };
}
