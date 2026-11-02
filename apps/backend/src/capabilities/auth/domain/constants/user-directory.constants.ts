import type { TUserStatus, UserRole } from '@ibm-talent-bridge/shared-types';

/** Roles que `GET /users` expone como opciones de selector (PM y reclutador para asignar; referentes técnicos para PROC-1c). */
export const DIRECTORY_ROLES: readonly UserRole[] = ['pm', 'recruiter', 'technical_ref'];

/** Roles de los que el directorio solo lista usuarios activos (un referente inactivo no puede asignarse). */
export const ACTIVE_ONLY_ROLES: readonly UserRole[] = ['technical_ref'];

export const USER_STATUSES: readonly TUserStatus[] = ['active', 'inactive'];
export const DEFAULT_USER_STATUS: TUserStatus = 'active';
/**
 * Banda del usuario: mismo rango que la banda de la oportunidad (`PROCESS_BAND_MIN/MAX` en `processes`).
 * Se redefine aquí porque `auth` no puede depender de `processes` (la dependencia va en sentido contrario).
 */
export const USER_BAND_MIN = 6;
export const USER_BAND_MAX = 10;
export const USER_DESCRIPTION_MAX = 500;
