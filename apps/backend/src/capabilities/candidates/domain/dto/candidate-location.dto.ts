import { IsOptional, IsString, MaxLength } from 'class-validator';
import { CANDIDATE_TEXT_MAX } from '../constants/candidate.constants';

export class CandidateLocationDto {
  @IsOptional() @IsString() @MaxLength(CANDIDATE_TEXT_MAX)
  country?: string;

  @IsOptional() @IsString() @MaxLength(CANDIDATE_TEXT_MAX)
  city?: string;
}
