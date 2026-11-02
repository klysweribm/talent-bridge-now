import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import {
  CANDIDATE_EDUCATION_YEAR_MAX, CANDIDATE_EDUCATION_YEAR_MIN, CANDIDATE_SUMMARY_MAX, CANDIDATE_TEXT_MAX,
} from '../constants/candidate.constants';

export class CandidateEducationDto {
  @IsOptional() @IsString() @MaxLength(CANDIDATE_TEXT_MAX)
  institution?: string;

  @IsOptional() @IsString() @MaxLength(CANDIDATE_TEXT_MAX)
  degree?: string;

  @IsOptional() @IsInt() @Min(CANDIDATE_EDUCATION_YEAR_MIN) @Max(CANDIDATE_EDUCATION_YEAR_MAX)
  year?: number;
}

export class CandidateExperienceDto {
  @IsOptional() @IsString() @MaxLength(CANDIDATE_TEXT_MAX)
  company?: string;

  @IsOptional() @IsString() @MaxLength(CANDIDATE_TEXT_MAX)
  role?: string;

  @IsOptional() @IsString() @MaxLength(CANDIDATE_TEXT_MAX)
  from?: string;

  @IsOptional() @IsString() @MaxLength(CANDIDATE_TEXT_MAX)
  to?: string;

  @IsOptional() @IsString() @MaxLength(CANDIDATE_SUMMARY_MAX)
  summary?: string;
}
