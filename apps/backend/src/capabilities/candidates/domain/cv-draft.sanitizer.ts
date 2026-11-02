import type { ICandidateProfileDraft, IDraftEducation, IDraftExperience, IDraftSkill, ILanguageLevel } from '@ibm-talent-bridge/shared-types';
import {
  CANDIDATE_EDUCATION_YEAR_MAX, CANDIDATE_EDUCATION_YEAR_MIN, CANDIDATE_EMAIL_MAX, CANDIDATE_EMAIL_PATTERN, CANDIDATE_LANGUAGE_CODE_PATTERN,
  CANDIDATE_LANGUAGE_LEVELS, CANDIDATE_LINKEDIN_PATTERN, CANDIDATE_PHONE_PATTERN, CANDIDATE_SENIORITIES,
  CANDIDATE_SKILL_LEVELS, CANDIDATE_SUMMARY_MAX, CANDIDATE_TEXT_MAX, CANDIDATE_YEARS_MAX,
} from './constants/candidate.constants';
import { compact, isAbsent, isRecord, Reader } from './cv-draft.reader';

export interface ISanitizedDraft {
  readonly draft: ICandidateProfileDraft;
  /** Cuántos valores no encajaron en el esquema y se descartaron (solo el número: nunca el contenido). */
  readonly dropped: number;
}

/** Campos del borrador que `findMissingFields` revisa, en orden estable. */
export const DRAFT_FIELDS = [
  'fullName', 'email', 'phone', 'linkedIn', 'location', 'primaryRole', 'seniority', 'yearsExperience',
  'skills', 'languages', 'education', 'experience', 'summary',
] as const satisfies readonly (keyof ICandidateProfileDraft)[];


function skill(reader: Reader, raw: unknown): IDraftSkill | undefined {
  const name = isRecord(raw) ? reader.text(raw.name) : undefined;
  if (!isRecord(raw) || name === undefined) return reader.reject();
  return compact({
    name, level: reader.oneOf(raw.level, CANDIDATE_SKILL_LEVELS), years: reader.number(raw.years, 0, CANDIDATE_YEARS_MAX),
  });
}

function language(reader: Reader, raw: unknown): ILanguageLevel | undefined {
  if (!isRecord(raw)) return reader.reject();
  const code = reader.text(typeof raw.code === 'string' ? raw.code.toLowerCase() : raw.code, 2, CANDIDATE_LANGUAGE_CODE_PATTERN);
  const level = reader.oneOf(raw.level, CANDIDATE_LANGUAGE_LEVELS);
  return code !== undefined && level !== undefined ? { code, level } : reader.reject();
}

const education = (reader: Reader, raw: unknown): IDraftEducation | undefined =>
  reader.object(raw, (r) => ({
    institution: reader.text(r.institution), degree: reader.text(r.degree),
    year: reader.number(r.year, CANDIDATE_EDUCATION_YEAR_MIN, CANDIDATE_EDUCATION_YEAR_MAX, true),
  }));

const experience = (reader: Reader, raw: unknown): IDraftExperience | undefined =>
  reader.object(raw, (r) => ({
    company: reader.text(r.company), role: reader.text(r.role), from: reader.text(r.from), to: reader.text(r.to),
    summary: reader.text(r.summary, CANDIDATE_SUMMARY_MAX),
  }));

/**
 * El modelo solo PROPONE un borrador: se conserva únicamente lo que encaja en el esquema (tipos, rangos,
 * listas cerradas, patrones) y se descarta el resto, incluidas las claves desconocidas. Un CV con
 * instrucciones maliciosas no puede producir nada fuera de este esquema.
 */
export function sanitizeDraft(raw: unknown): ISanitizedDraft {
  const reader = new Reader();
  if (!isRecord(raw)) return { draft: {}, dropped: isAbsent(raw) ? 0 : 1 };
  const known: readonly string[] = DRAFT_FIELDS;
  const unknownKeys = Object.keys(raw).filter((key) => !known.includes(key)).length;
  const email = reader.text(raw.email, CANDIDATE_EMAIL_MAX, CANDIDATE_EMAIL_PATTERN)?.toLowerCase();
  const draft: ICandidateProfileDraft = compact({
    fullName: reader.text(raw.fullName),
    email,
    phone: reader.text(raw.phone, CANDIDATE_TEXT_MAX, CANDIDATE_PHONE_PATTERN),
    linkedIn: reader.text(raw.linkedIn, CANDIDATE_TEXT_MAX, CANDIDATE_LINKEDIN_PATTERN),
    location: isAbsent(raw.location) ? undefined : reader.object(raw.location, (r) => ({ country: reader.text(r.country), city: reader.text(r.city) })),
    primaryRole: reader.text(raw.primaryRole),
    seniority: reader.oneOf(raw.seniority, CANDIDATE_SENIORITIES),
    yearsExperience: reader.number(raw.yearsExperience, 0, CANDIDATE_YEARS_MAX),
    skills: reader.list(raw.skills, (item) => skill(reader, item)),
    languages: reader.list(raw.languages, (item) => language(reader, item)),
    education: reader.list(raw.education, (item) => education(reader, item)),
    experience: reader.list(raw.experience, (item) => experience(reader, item)),
    summary: reader.text(raw.summary, CANDIDATE_SUMMARY_MAX),
  });
  return { draft, dropped: reader.dropped + unknownKeys };
}

/** Campos que el extractor no pudo rellenar (ausentes o con lista vacía). */
export function findMissingFields(draft: ICandidateProfileDraft): readonly string[] {
  return DRAFT_FIELDS.filter((field) => {
    const value = draft[field];
    return value === undefined || (Array.isArray(value) && value.length === 0);
  });
}
