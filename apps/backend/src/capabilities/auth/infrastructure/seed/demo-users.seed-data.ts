import type { UserRole } from '@ibm-talent-bridge/shared-types';

export interface IDemoUserSeed {
  readonly email: string;
  readonly fullName: string;
  readonly role: UserRole;
  readonly timezone: string;
}

/**
 * Usuarios demo sembrados en Mongo para AUTH-1 (dev-login). El frontend ya no
 * guarda una copia: `auth.infra.ts` consume estos usuarios vía `POST /auth/dev-login`.
 */
export const DEMO_USERS_SEED: readonly IDemoUserSeed[] = [
  { email: 'ana@ibm.com', fullName: 'Ana García', role: 'recruiter', timezone: 'America/Bogota' },
  {
    email: 'carlos@ibm.com',
    fullName: 'Carlos Londoño',
    role: 'technical_ref',
    timezone: 'America/Bogota',
  },
  { email: 'mariana@ibm.com', fullName: 'Mariana López', role: 'pm', timezone: 'America/Bogota' },
] as const;
