import type { TLanguageProficiency, TSkillLevelValue } from '@ibm-talent-bridge/shared-types';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import {
  CANDIDATE_LANGUAGE_CODE_PATTERN, CANDIDATE_LANGUAGE_LEVELS, CANDIDATE_SKILL_LEVELS, CANDIDATE_TEXT_MAX, CANDIDATE_YEARS_MAX,
} from '../constants/candidate.constants';

export class CandidateSkillDto {
  @IsString() @IsNotEmpty() @MaxLength(CANDIDATE_TEXT_MAX)
  name!: string;

  @IsOptional() @IsIn(CANDIDATE_SKILL_LEVELS)
  level?: TSkillLevelValue;

  @IsOptional() @IsNumber() @Min(0) @Max(CANDIDATE_YEARS_MAX)
  years?: number;
}

export class CandidateLanguageDto {
  @Matches(CANDIDATE_LANGUAGE_CODE_PATTERN)
  code!: string;

  @IsIn(CANDIDATE_LANGUAGE_LEVELS)
  level!: TLanguageProficiency;
}
