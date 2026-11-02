import type { ICandidateProfileDraft, ICreateCandidateRequest, IDraftSkill, TSeniority } from '@ibm-talent-bridge/shared-types';
import { SENIORITY_VALUES } from '@features/bench/config/bench.constants';

export interface ICandidateFormValues {
  readonly fullName: string;
  readonly email: string;
  readonly phone: string;
  readonly linkedIn: string;
  readonly country: string;
  readonly city: string;
  readonly primaryRole: string;
  readonly seniority: '' | TSeniority;
  readonly yearsExperience: string;
  readonly skills: string;
  readonly summary: string;
}

export const EMPTY_FORM_VALUES: ICandidateFormValues = {
  fullName: '', email: '', phone: '', linkedIn: '', country: '', city: '',
  primaryRole: '', seniority: '', yearsExperience: '', skills: '', summary: '',
};

const text = (value: string | undefined): string => value ?? '';

export function draftToFormValues(draft: ICandidateProfileDraft): ICandidateFormValues {
  return {
    fullName: text(draft.fullName), email: text(draft.email), phone: text(draft.phone),
    linkedIn: text(draft.linkedIn), country: text(draft.location?.country), city: text(draft.location?.city),
    primaryRole: text(draft.primaryRole),
    seniority: SENIORITY_VALUES.find(value => value === draft.seniority) ?? '',
    yearsExperience: text(draft.yearsExperience?.toString()),
    skills: (draft.skills ?? []).map(skill => skill.name).join(', '),
    summary: text(draft.summary),
  };
}

// Conserva nivel y años de las skills del borrador cuando el nombre sigue igual.
function parseSkills(text: string, original: readonly IDraftSkill[]): readonly IDraftSkill[] {
  return text.split(',').map(name => name.trim()).filter(Boolean).map(name =>
    original.find(skill => skill.name.toLowerCase() === name.toLowerCase()) ?? { name });
}

const optional = (value: string): string | undefined => value.trim() || undefined;

/** Valores editados + lo que el formulario no edita (idiomas, estudios, experiencia) del borrador. */
export function formValuesToRequest(values: ICandidateFormValues, draft: ICandidateProfileDraft): ICreateCandidateRequest {
  const country = optional(values.country);
  const city = optional(values.city);
  const years = optional(values.yearsExperience);
  return {
    fullName: values.fullName.trim(), email: values.email.trim(),
    phone: optional(values.phone), linkedIn: optional(values.linkedIn),
    location: country || city ? { country, city } : undefined,
    primaryRole: optional(values.primaryRole), seniority: values.seniority || undefined,
    yearsExperience: years === undefined ? undefined : Number(years),
    skills: parseSkills(values.skills, draft.skills ?? []),
    summary: optional(values.summary),
    languages: draft.languages, education: draft.education, experience: draft.experience,
  };
}
