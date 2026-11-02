import type { UserRole } from '@ibm-talent-bridge/shared-types';

/** Roles que `GET /users` expone como opciones de selector. `technical_ref` queda fuera a propósito. */
export const DIRECTORY_ROLES: readonly UserRole[] = ['pm', 'recruiter'];
