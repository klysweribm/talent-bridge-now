// USERS — perfil enriquecido de un usuario (PROC-1c). Solo tipos.

import type { UserRole } from './index';

/** Un usuario `inactive` sigue existiendo pero no puede asignarse a procesos nuevos. Los documentos sin el campo se leen como `active`. */
export type TUserStatus = 'active' | 'inactive';

/** Ficha de un usuario tal como la expone el backend a otras capabilities y al detalle de un proceso (sin teléfono ni datos de CV). */
export interface IUserProfile {
  readonly id: string;
  readonly fullName: string;
  readonly email: string;
  readonly role: UserRole;
  /** Banda del usuario (entero); `null` si no la tiene. */
  readonly band: number | null;
  /** '' si no tiene descripción. */
  readonly description: string;
  readonly status: TUserStatus;
  readonly avatarUrl?: string;
}
