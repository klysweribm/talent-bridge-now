import type { ILanguageLevel, ISkillLevel } from '@ibm-talent-bridge/shared-types';
import {
  BENCH_SENIORITIES, BENCH_STATUSES, LANGUAGE_PROFICIENCIES, SKILL_LEVEL_VALUES,
} from '../../domain/constants/bench.constants';

export type TRecord = Readonly<Record<string, unknown>>;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const BENCH_CODE = /^BN-\d{4}$/;
const ISO_LANGUAGE = /^[a-z]{2}$/;

export const isRecord = (value: unknown): value is TRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

export const isBenchCode = (value: unknown): value is string =>
  typeof value === 'string' && BENCH_CODE.test(value);

export const isIsoDate = (value: unknown): value is string =>
  typeof value === 'string' && ISO_DATE.test(value) && !Number.isNaN(Date.parse(value));

export const isOneOf = <T extends string>(allowed: readonly T[]) => (value: unknown): value is T =>
  typeof value === 'string' && (allowed as readonly string[]).includes(value);

export const isSeniority = isOneOf(BENCH_SENIORITIES);
export const isBenchStatus = isOneOf(BENCH_STATUSES);

export const isSkillLevel = (value: unknown): value is ISkillLevel =>
  isRecord(value) &&
  isNonEmptyString(value.name) &&
  (SKILL_LEVEL_VALUES as readonly unknown[]).includes(value.level) &&
  typeof value.years === 'number' && value.years >= 0;

export const isLanguageLevel = (value: unknown): value is ILanguageLevel =>
  isRecord(value) &&
  typeof value.code === 'string' && ISO_LANGUAGE.test(value.code) &&
  isOneOf(LANGUAGE_PROFICIENCIES)(value.level);

export const isLocation = (value: unknown): boolean =>
  isRecord(value) && isNonEmptyString(value.country) && isNonEmptyString(value.city);

export const isNonEmptyArrayOf = <T>(guard: (item: unknown) => item is T) =>
  (value: unknown): value is readonly T[] =>
    Array.isArray(value) && value.length > 0 && value.every(guard);
