import type { IOpportunityDraftFields, IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { PROCESS_BAND_MAX, PROCESS_BAND_MIN } from '../../../processes/domain/constants/process.constants';
import { normalizeSkills } from '../../../../shared/skills/skill-normalizer';
import { isRealDate } from '../../../../shared/validation/is-real-date';

export const BAND_WARNING = `No se pudo deducir la banda (${PROCESS_BAND_MIN} a ${PROCESS_BAND_MAX}): indícala a mano.`;
export const START_DATE_WARNING = 'La fecha de inicio no es una fecha válida (AAAA-MM-DD): indícala a mano.';

type TTextField = 'title' | 'clientName' | 'opportunityRole' | 'roleDescription';
const TEXT_FIELDS: readonly TTextField[] = ['title', 'clientName', 'opportunityRole', 'roleDescription'];
const FIELD_ORDER: readonly (keyof IOpportunityDraftFields)[] = [
  'title', 'clientName', 'opportunityRole', 'skills', 'roleDescription', 'band', 'startDate',
];

const asRecord = (value: unknown): Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>) : {};

const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const asSkills = (value: unknown): readonly string[] =>
  Array.isArray(value) ? normalizeSkills(value.filter((item): item is string => typeof item === 'string')) : [];

const asBand = (value: unknown): number | null =>
  typeof value === 'number' && Number.isInteger(value) && value >= PROCESS_BAND_MIN && value <= PROCESS_BAND_MAX ? value : null;

const asStartDate = (value: unknown): string | null => (isRealDate(value) ? (value as string) : null);

const isEmpty = (value: IOpportunityDraftFields[keyof IOpportunityDraftFields]): boolean =>
  value === null || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * Convierte la salida del modelo (no confiable) en el borrador del formulario. Solo lee las 7 claves
 * conocidas: cualquier otra se ignora, así que el texto del usuario nunca puede añadir ni alterar campos.
 * Lo que no encaja queda vacío (nunca inventado) y se avisa (R2).
 */
export function sanitizeOpportunityDraft(output: unknown): IOpportunityDraftResponse {
  const source = asRecord(output);
  const text = Object.fromEntries(TEXT_FIELDS.map((field) => [field, asText(source[field])])) as Record<TTextField, string>;
  const draft: IOpportunityDraftFields = {
    ...text,
    skills: asSkills(source['skills']),
    band: asBand(source['band']),
    startDate: asStartDate(source['startDate']),
  };
  const startDateGiven = source['startDate'] !== null && source['startDate'] !== undefined && source['startDate'] !== '';
  return {
    draft,
    missingFields: FIELD_ORDER.filter((field) => isEmpty(draft[field])),
    warnings: [
      ...(draft.band === null ? [BAND_WARNING] : []),
      ...(draft.startDate === null && startDateGiven ? [START_DATE_WARNING] : []),
    ],
  };
}
