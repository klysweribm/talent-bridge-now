import { Transform } from 'class-transformer';
import { IsIn, IsNotEmpty, IsString, MaxLength, ValidateIf } from 'class-validator';
import { PROCESS_CLIENT_NAME_MAX, PROCESS_STATUSES, PROCESS_TITLE_MAX } from '../constants/process.constants';
import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';

const trim = ({ value }: { value: unknown }): unknown => (typeof value === 'string' ? value.trim() : value);
/** Omite la validación solo si el campo falta: `null` sí se valida y falla (a diferencia de `@IsOptional()`). */
const present = (_: unknown, value: unknown): boolean => value !== undefined;

/** Cuerpo de `PATCH /processes/:id` (`IUpdateProcessRequest`): todo opcional, pero nunca `null`. */
export class UpdateProcessDto {
  @ValidateIf(present) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(PROCESS_TITLE_MAX)
  title?: string;

  @ValidateIf(present) @Transform(trim) @IsString() @IsNotEmpty() @MaxLength(PROCESS_CLIENT_NAME_MAX)
  clientName?: string;

  @ValidateIf(present) @IsString() @IsNotEmpty()
  recruiterId?: string;

  @ValidateIf(present) @IsIn(PROCESS_STATUSES)
  status?: TProcessStatus;
}
