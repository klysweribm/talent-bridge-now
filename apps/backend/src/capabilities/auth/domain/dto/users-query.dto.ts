import { Type } from 'class-transformer';
import { IsIn, IsInt, Max, Min } from 'class-validator';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../../../../shared/pagination/pagination.constants';
import { DIRECTORY_ROLES } from '../constants/user-directory.constants';
import type { UserRole } from '@ibm-talent-bridge/shared-types';

/** Query de `GET /users`: `role` es obligatorio y admite los roles de `DIRECTORY_ROLES`. */
export class UsersQueryDto {
  @IsIn(DIRECTORY_ROLES)
  role!: UserRole;

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
