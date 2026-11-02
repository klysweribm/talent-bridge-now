import type { TUserStatus, UserRole } from '@ibm-talent-bridge/shared-types';
import * as demoUsers from './demo-users.seed.json';

export interface IDemoUserSeed {
  readonly email: string;
  readonly fullName: string;
  readonly role: UserRole;
  readonly timezone: string;
  readonly band?: number;
  readonly description?: string;
  readonly status?: TUserStatus;
}

/** Campos del perfil que el seeder rellena en usuarios ya existentes que no los tienen (nunca pisa los ya presentes). */
export const BACKFILL_FIELDS = ['band', 'description', 'status'] as const;

/**
 * Usuarios demo sembrados en Mongo para AUTH-1 (dev-login). Los datos viven en
 * `demo-users.seed.json` (igual que la banca en `bench.mock.json`); el frontend
 * los consume vía `POST /auth/dev-login`.
 */
export const DEMO_USERS_SEED: readonly IDemoUserSeed[] = demoUsers as unknown as readonly IDemoUserSeed[];
