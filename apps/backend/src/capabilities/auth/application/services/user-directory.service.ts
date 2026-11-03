import { Inject, Injectable } from '@nestjs/common';
import type { IUserOption, IUserProfile, PaginatedResponse, UserRole } from '@ibm-talent-bridge/shared-types';
import { ACTIVE_ONLY_ROLES } from '../../domain/constants/user-directory.constants';
import { USER_DIRECTORY_PORT, type IUserDirectoryPort } from '../ports/user-directory.port';

@Injectable()
export class UserDirectoryService {
  constructor(@Inject(USER_DIRECTORY_PORT) private readonly directory: IUserDirectoryPort) {}

  async listByRole(role: UserRole, page: number, limit: number): Promise<PaginatedResponse<IUserOption>> {
    const onlyActive = ACTIVE_ONLY_ROLES.includes(role);
    const [data, total] = await Promise.all([
      this.directory.findOptionsByRole(role, page, limit, onlyActive),
      this.directory.countByRole(role, onlyActive),
    ]);
    return { data: [...data], total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Lo usan otras capabilities (p. ej. `processes`) para validar el rol de un usuario. */
  findRole(id: string): Promise<UserRole | null> {
    return this.directory.findRoleById(id);
  }

  /** Fichas de los usuarios existentes entre `ids`, en una sola consulta (sin orden garantizado). */
  findProfiles(ids: readonly string[]): Promise<readonly IUserProfile[]> {
    return this.directory.findProfilesByIds(ids);
  }
}
