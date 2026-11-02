import type { TLanguageProficiency, TSeniority, TSkillLevelValue } from '@ibm-talent-bridge/shared-types';

export const CANDIDATE_SENIORITIES: readonly TSeniority[] = ['jr', 'ssr', 'sr', 'lead'];
export const CANDIDATE_SKILL_LEVELS: readonly TSkillLevelValue[] = [1, 2, 3, 4, 5];
export const CANDIDATE_LANGUAGE_LEVELS: readonly TLanguageProficiency[] = ['basic', 'intermediate', 'advanced', 'native'];

export const CANDIDATE_TEXT_MAX = 200;
export const CANDIDATE_EMAIL_MAX = 254;
export const CANDIDATE_SUMMARY_MAX = 2000;
export const CANDIDATE_LIST_MAX = 50;
export const CANDIDATE_YEARS_MAX = 70;
export const CANDIDATE_EDUCATION_YEAR_MIN = 1950;
export const CANDIDATE_EDUCATION_YEAR_MAX = 2100;

export const CANDIDATE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const CANDIDATE_PHONE_PATTERN = /^\+?\d[\d\s().-]{5,24}$/;
export const CANDIDATE_LINKEDIN_PATTERN = /^https:\/\/([a-z0-9-]+\.)?linkedin\.com\/\S*$/i;
export const CANDIDATE_LANGUAGE_CODE_PATTERN = /^[a-z]{2}$/;

export const CANDIDATE_REPOSITORY_PORT = Symbol('CANDIDATE_REPOSITORY_PORT');
export const CANDIDATE_SIMILAR_LIMIT = 5;
