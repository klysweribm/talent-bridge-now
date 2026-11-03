import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from './pagination.constants';

/** `?page&limit` común a los listados paginados: fuera de rango es 400. */
export class PaginationQueryDto {
  @Type(() => Number) @IsInt() @Min(1)
  page: number = DEFAULT_PAGE;

  @Type(() => Number) @IsInt() @Min(1) @Max(MAX_LIMIT)
  limit: number = DEFAULT_LIMIT;
}
