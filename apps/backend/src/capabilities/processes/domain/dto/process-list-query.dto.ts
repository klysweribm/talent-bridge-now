import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../shared/pagination/pagination-query.dto';
import { PROCESS_SEARCH_MAX } from '../constants/process.constants';

/** Un término vacío o de solo espacios equivale a no filtrar; los no-string (p. ej. `?q=a&q=b`) siguen siendo 400. */
const trimmedOrUndefined = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
};

export class ProcessListQueryDto extends PaginationQueryDto {
  @IsOptional() @Transform(trimmedOrUndefined) @IsString() @MaxLength(PROCESS_SEARCH_MAX)
  q?: string;
}
