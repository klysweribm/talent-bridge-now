import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, MaxLength, ValidateIf } from 'class-validator';
import { PROCESS_CLIENT_NAME_MAX, PROCESS_STATUSES, PROCESS_TITLE_MAX } from '../constants/process.constants';
import { BandField, OpportunityRoleField, present, RoleDescriptionField, SkillsField, TechnicalRefIdsField, trim } from './process-field.decorators';
import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';


/** Cuerpo de `PATCH /processes/:id` (`IUpdateProcessRequest`): todo opcional, pero nunca `null`. */
export class UpdateProcessDto {
  @ValidateIf(present) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(PROCESS_TITLE_MAX)
  title?: string;

  @ValidateIf(present) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(PROCESS_CLIENT_NAME_MAX)
  clientName?: string;

  @OpportunityRoleField(true)
  opportunityRole?: string;

  @SkillsField(true)
  skills?: string[];

  @RoleDescriptionField(true)
  roleDescription?: string;

  @BandField(true)
  band?: number;

  @ValidateIf(present) @IsString() @IsNotEmpty()
  recruiterId?: string;

  @ValidateIf(present) @IsIn(PROCESS_STATUSES)
  status?: TProcessStatus;

  @TechnicalRefIdsField(true)
  technicalRefIds?: string[];
}
