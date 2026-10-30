import type { TBenchStatus, TSeniority } from '@ibm-talent-bridge/shared-types';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize, IsIn, IsInt, IsISO8601, IsNotEmpty, IsOptional, IsString, Matches, Max, Min,
} from 'class-validator';
import {
  AVAILABLE_BY_PATTERN, BENCH_SENIORITIES, BENCH_STATUSES, DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT, MAX_SKILLS_FILTER,
} from '../constants/bench.constants';
import { toTrimmedList, toTrimmedString } from './query-transforms';

export class BenchQueryDto {
  @IsOptional()
  @Transform(toTrimmedList)
  @ArrayMaxSize(MAX_SKILLS_FILTER)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  skills?: string[];

  @IsOptional()
  @Transform(toTrimmedList)
  @IsIn(BENCH_SENIORITIES, { each: true })
  seniority?: TSeniority[];

  @IsOptional()
  @Matches(AVAILABLE_BY_PATTERN)
  @IsISO8601({ strict: true })
  availableBy?: string;

  @IsOptional()
  @Transform(toTrimmedString)
  @IsString()
  @IsNotEmpty()
  country?: string;

  @IsOptional()
  @Transform(toTrimmedList)
  @IsIn(BENCH_STATUSES, { each: true })
  status?: TBenchStatus[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = DEFAULT_PAGE;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit: number = DEFAULT_LIMIT;
}
