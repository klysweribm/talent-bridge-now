import type { IAuthEvent } from '../../domain/interfaces/auth-event.interface';

/**
 * Puerto de salida hacia la auditoría de sesión (`auth_events`). El adapter
 * Mongoose vive en `infrastructure/adapters/mongoose-auth-event.adapter.ts`.
 */
export interface IAuthEventRepositoryPort {
  record(event: IAuthEvent): Promise<void>;
}

export const AUTH_EVENT_REPOSITORY_PORT = Symbol('AUTH_EVENT_REPOSITORY_PORT');
