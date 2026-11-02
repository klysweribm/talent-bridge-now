import { Transform } from 'class-transformer';
import { ArrayMaxSize, IsArray, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PROCESS_CANDIDATE_IDS_MAX, PROCESS_CLIENT_NAME_MAX, PROCESS_TITLE_MAX } from '../constants/process.constants';

const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);

/** Cuerpo de `POST /processes` (`ICreateProcessRequest`). El autor nunca viene del cuerpo. */
export class CreateProcessDto {
  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(PROCESS_TITLE_MAX)
  title!: string;

  @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(PROCESS_CLIENT_NAME_MAX)
  clientName!: string;

  @IsOptional() @IsString() @IsNotEmpty()
  ownerPmId?: string;

  @IsOptional() @IsString() @IsNotEmpty()
  recruiterId?: string;

  @IsOptional() @IsArray() @ArrayMaxSize(PROCESS_CANDIDATE_IDS_MAX) @IsString({ each: true })
  candidateIds?: string[];
}
