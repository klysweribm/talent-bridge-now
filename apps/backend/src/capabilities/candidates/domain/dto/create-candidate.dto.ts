import { Type } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { CANDIDATE_LIST_MAX } from '../constants/candidate.constants';
import { CandidateBasicsDto } from './candidate-basics.dto';
import { CandidateEducationDto, CandidateExperienceDto } from './candidate-history.dto';
import { CandidateLocationDto } from './candidate-location.dto';
import { CandidateLanguageDto, CandidateSkillDto } from './candidate-skill-language.dto';

/** Cuerpo de `POST /candidates` (`ICreateCandidateRequest`): email válido y nombre obligatorios, el resto opcional. */
export class CreateCandidateDto extends CandidateBasicsDto {
  @IsOptional() @ValidateNested() @Type(() => CandidateLocationDto)
  location?: CandidateLocationDto;

  @IsOptional() @IsArray() @ArrayMaxSize(CANDIDATE_LIST_MAX) @ValidateNested({ each: true }) @Type(() => CandidateSkillDto)
  skills?: CandidateSkillDto[];

  @IsOptional() @IsArray() @ArrayMaxSize(CANDIDATE_LIST_MAX) @ValidateNested({ each: true }) @Type(() => CandidateLanguageDto)
  languages?: CandidateLanguageDto[];

  @IsOptional() @IsArray() @ArrayMaxSize(CANDIDATE_LIST_MAX) @ValidateNested({ each: true }) @Type(() => CandidateEducationDto)
  education?: CandidateEducationDto[];

  @IsOptional() @IsArray() @ArrayMaxSize(CANDIDATE_LIST_MAX) @ValidateNested({ each: true }) @Type(() => CandidateExperienceDto)
  experience?: CandidateExperienceDto[];
}
