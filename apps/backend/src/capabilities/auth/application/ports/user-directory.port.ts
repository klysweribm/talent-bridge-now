import type { IUserOption, UserRole } from '@ibm-talent-bridge/shared-types';

/** Puerto de lectura del directorio de usuarios (solo id y nombre). Distinto del repositorio de login. */
export interface IUserDirectoryPort {
  findOptionsByRole(role: UserRole, page: number, limit: number): Promise<readonly IUserOption[]>;
  countByRole(role: UserRole): Promise<number>;
  /** Rol del usuario, o `null` si no existe (un id mal formado cuenta como inexistente). */
  findRoleById(id: string): Promise<UserRole | null>;
}

export const USER_DIRECTORY_PORT = Symbol('USER_DIRECTORY_PORT');
