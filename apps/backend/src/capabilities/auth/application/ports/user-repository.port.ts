import type { User } from '@ibm-talent-bridge/shared-types';

/**
 * Puerto de salida hacia la persistencia de usuarios. `AuthService` depende
 * solo de esta abstracción; el adapter Mongoose vive en
 * `infrastructure/adapters/mongoose-user.adapter.ts`.
 */
export interface IUserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
}

export const USER_REPOSITORY_PORT = Symbol('USER_REPOSITORY_PORT');
