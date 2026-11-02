import { Inject, Injectable } from '@nestjs/common';
import type { IUserOption, PaginatedResponse, UserRole } from '@ibm-talent-bridge/shared-types';
import { USER_DIRECTORY_PORT, type IUserDirectoryPort } from '../ports/user-directory.port';

@Injectable()
export class UserDirectoryService {
  constructor(@Inject(USER_DIRECTORY_PORT) private readonly directory: IUserDirectoryPort) {}

  async listByRole(role: UserRole, page: number, limit: number): Promise<PaginatedResponse<IUserOption>> {
    const [data, total] = await Promise.all([
      this.directory.findOptionsByRole(role, page, limit),
      this.directory.countByRole(role),
    ]);
    return { data: [...data], total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  /** Lo usan otras capabilities (p. ej. `processes`) para validar el rol de un usuario. */
  findRole(id: string): Promise<UserRole | null> {
    return this.directory.findRoleById(id);
  }
}
