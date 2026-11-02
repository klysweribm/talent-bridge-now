import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PROCESS_CLIENT_NAME_MAX, PROCESS_STATUSES, PROCESS_TITLE_MAX } from '../constants/process.constants';
import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';

const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);

/** Cuerpo de `PATCH /processes/:id` (`IUpdateProcessRequest`): todo opcional. */
export class UpdateProcessDto {
  @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(PROCESS_TITLE_MAX)
  title?: string;

  @IsOptional() @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(PROCESS_CLIENT_NAME_MAX)
  clientName?: string;

  @IsOptional() @IsString() @IsNotEmpty()
  recruiterId?: string;

  @IsOptional() @IsIn(PROCESS_STATUSES)
  status?: TProcessStatus;
}
