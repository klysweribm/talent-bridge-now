import type { TSeniority } from '@ibm-talent-bridge/shared-types';
import { Transform } from 'class-transformer';
import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Max, MaxLength, Min } from 'class-validator';
import {
  CANDIDATE_EMAIL_MAX, CANDIDATE_LINKEDIN_PATTERN, CANDIDATE_PHONE_PATTERN, CANDIDATE_SENIORITIES, CANDIDATE_SUMMARY_MAX,
  CANDIDATE_TEXT_MAX, CANDIDATE_YEARS_MAX,
} from '../constants/candidate.constants';

/** Campos escalares del candidato; `CreateCandidateDto` añade las listas y la ubicación. */
const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);

export class CandidateBasicsDto {
  @Transform(trim) @IsEmail() @MaxLength(CANDIDATE_EMAIL_MAX)
  email!: string;

  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(CANDIDATE_TEXT_MAX)
  fullName!: string;

  @IsOptional() @Matches(CANDIDATE_PHONE_PATTERN)
  phone?: string;

  @IsOptional() @Matches(CANDIDATE_LINKEDIN_PATTERN) @MaxLength(CANDIDATE_TEXT_MAX)
  linkedIn?: string;

  @IsOptional() @IsString() @IsNotEmpty() @MaxLength(CANDIDATE_TEXT_MAX)
  primaryRole?: string;

  @IsOptional() @IsIn(CANDIDATE_SENIORITIES)
  seniority?: TSeniority;

  @IsOptional() @IsNumber() @Min(0) @Max(CANDIDATE_YEARS_MAX)
  yearsExperience?: number;

  @IsOptional() @IsString() @MaxLength(CANDIDATE_SUMMARY_MAX)
  summary?: string;
}
