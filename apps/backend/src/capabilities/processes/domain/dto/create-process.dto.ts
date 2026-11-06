import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { BandField, OpportunityRoleField, RoleDescriptionField, SkillsField, StartDateField, trim } from './process-field.decorators';
import { PROCESS_CANDIDATE_IDS_MAX, PROCESS_CLIENT_NAME_MAX, PROCESS_TITLE_MAX } from '../constants/process.constants';


/** Cuerpo de `POST /processes` (`ICreateProcessRequest`). El autor nunca viene del cuerpo. */
export class CreateProcessDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(PROCESS_TITLE_MAX)
  title!: string;

  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(PROCESS_CLIENT_NAME_MAX)
  clientName!: string;

  @OpportunityRoleField()
  opportunityRole!: string;

  @SkillsField()
  skills!: string[];

  @RoleDescriptionField()
  roleDescription!: string;

  @BandField()
  band!: number;

  @StartDateField(true)
  startDate?: string;

  @IsOptional() @IsString() @IsNotEmpty()
  ownerPmId?: string;

  @IsOptional() @IsString() @IsNotEmpty()
  recruiterId?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(PROCESS_CANDIDATE_IDS_MAX) @IsString({ each: true })
  candidateIds?: string[];
}
