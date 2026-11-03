import { IsIn, IsOptional } from 'class-validator';
import type { TCandidateAssignment } from '@ibm-talent-bridge/shared-types';
import { PaginationQueryDto } from '../../../../shared/pagination/pagination-query.dto';
import { CANDIDATE_ASSIGNMENTS } from '../constants/candidate.constants';

/** `GET /candidates?page&limit&assignment`: `assignment` ausente = todos. */
export class CandidatesQueryDto extends PaginationQueryDto {
  @IsOptional() @IsIn(CANDIDATE_ASSIGNMENTS)
  assignment?: TCandidateAssignment;
}
