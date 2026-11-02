import { HttpError } from '@shared/infrastructure/httpError';
import { HTTP_FORBIDDEN, HTTP_NOT_FOUND, HTTP_UNAVAILABLE } from '../config/processCreate.constants';
import { PROCESS_ACTION_ERRORS, PROCESS_ERROR_CODES } from '../config/processActions.constants';

/** Error de una acción sobre el proceso, con el copy de usuario ya traducido por código. */
export class ProcessActionError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = 'ProcessActionError';
  }
}

const COPY_BY_CODE: Readonly<Record<string, string>> = {
  [PROCESS_ERROR_CODES.terminalState]:            PROCESS_ACTION_ERRORS.terminalState,
  [PROCESS_ERROR_CODES.candidateLimit]:           PROCESS_ACTION_ERRORS.candidateLimit,
  [PROCESS_ERROR_CODES.candidateAlreadyAssigned]: PROCESS_ACTION_ERRORS.candidateAlreadyAssigned,
  [PROCESS_ERROR_CODES.releaseFailed]:            PROCESS_ACTION_ERRORS.releaseFailed,
};

export function errorCode(error: HttpError): string | undefined {
  const { body } = error;
  if (typeof body !== 'object' || body === null) return undefined;
  const { code } = body as { code?: unknown };
  return typeof code === 'string' ? code : undefined;
}

/** Traduce por `body.code` (nunca por el texto en inglés); 403/404 por estado. */
export function translateProcessActionError(error: unknown): ProcessActionError {
  if (!(error instanceof HttpError)) return new ProcessActionError(PROCESS_ACTION_ERRORS.generic);
  const code = errorCode(error);
  if (code && COPY_BY_CODE[code]) return new ProcessActionError(COPY_BY_CODE[code]);
  if (error.status === HTTP_FORBIDDEN) return new ProcessActionError(PROCESS_ACTION_ERRORS.forbidden);
  if (error.status === HTTP_NOT_FOUND) return new ProcessActionError(PROCESS_ACTION_ERRORS.notFound);
  if (error.status === HTTP_UNAVAILABLE) return new ProcessActionError(PROCESS_ACTION_ERRORS.serviceUnavailable);
  return new ProcessActionError(PROCESS_ACTION_ERRORS.generic);
}
