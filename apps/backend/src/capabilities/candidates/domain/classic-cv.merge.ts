import type { ICandidateProfileDraft, IDraftSkill } from '@ibm-talent-bridge/shared-types';
import { DRAFT_FIELDS } from './cv-draft.sanitizer';

export interface IMergedDraft {
  readonly draft: ICandidateProfileDraft;
  /** `true` si ICA aportó al menos un dato que las reglas no tenían. */
  readonly contributed: boolean;
}

const isEmpty = (value: unknown): boolean =>
  value === undefined || value === null || (Array.isArray(value) && value.length === 0) ||
  (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0);

function mergeSkills(rules: readonly IDraftSkill[], ica: readonly IDraftSkill[]): readonly IDraftSkill[] {
  const seen = new Set(rules.map((skill) => skill.name.toLowerCase()));
  const extra = ica.filter((skill) => {
    const key = skill.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return [...rules, ...extra];
}

/**
 * Las reglas ganan donde encontraron algo (una regex determinista pesa más que el modelo, sobre todo en los
 * datos de contacto); ICA solo rellena lo vacío. En `skills` se conservan las de las reglas y se añaden las de ICA que falten.
 */
export function mergeRulesWithIca(rules: ICandidateProfileDraft, ica: ICandidateProfileDraft): IMergedDraft {
  const merged: Record<string, unknown> = {};
  let contributed = false;
  for (const field of DRAFT_FIELDS) {
    const picked = pick(field, rules, ica);
    if (picked.value !== undefined) merged[field] = picked.value;
    contributed ||= picked.fromIca;
  }
  return { draft: merged as ICandidateProfileDraft, contributed };
}

function pick(field: (typeof DRAFT_FIELDS)[number], rules: ICandidateProfileDraft, ica: ICandidateProfileDraft): { value: unknown; fromIca: boolean } {
  if (isEmpty(rules[field])) return isEmpty(ica[field]) ? { value: undefined, fromIca: false } : { value: ica[field], fromIca: true };
  if (field !== 'skills' || isEmpty(ica.skills)) return { value: rules[field], fromIca: false };
  const skills = mergeSkills(rules.skills ?? [], ica.skills ?? []);
  return { value: skills, fromIca: skills.length > (rules.skills?.length ?? 0) };
}
