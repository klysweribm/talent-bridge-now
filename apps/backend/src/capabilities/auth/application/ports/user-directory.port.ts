import type { IUserOption, IUserProfile, UserRole } from '@ibm-talent-bridge/shared-types';

/** Puerto de lectura del directorio de usuarios. Distinto del repositorio de login. */
export interface IUserDirectoryPort {
  /** Con `onlyActive`, excluye a los usuarios con `status: 'inactive'` (los documentos sin `status` cuentan como activos). */
  findOptionsByRole(role: UserRole, page: number, limit: number, onlyActive?: boolean): Promise<readonly IUserOption[]>;
  countByRole(role: UserRole, onlyActive?: boolean): Promise<number>;
  /** Rol del usuario, o `null` si no existe (un id mal formado cuenta como inexistente). */
  findRoleById(id: string): Promise<UserRole | null>;
  /** Fichas de los ids que existen, en una sola consulta; los ids inexistentes o mal formados se omiten. Sin orden garantizado. */
  findProfilesByIds(ids: readonly string[]): Promise<readonly IUserProfile[]>;
}

export const USER_DIRECTORY_PORT = Symbol('USER_DIRECTORY_PORT');
