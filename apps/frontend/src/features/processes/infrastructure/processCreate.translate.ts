import { HttpError } from '@shared/infrastructure/httpError';
import { HTTP_NOT_FOUND, HTTP_UNAVAILABLE } from '../config/processCreate.constants';
import { PROCESS_ERROR_CODES } from '../config/processActions.constants';
import {
  CandidateAlreadyAssignedError, CandidateLimitExceededError, CandidateNotFoundForProcessError, ProcessServiceUnavailableError,
} from './processCreate.errors';
import { errorCode } from './processUpdate.translate';

export function translateCreateProcessError(error: unknown): unknown {
  if (!(error instanceof HttpError)) return error;
  const code = errorCode(error);
  if (code === PROCESS_ERROR_CODES.candidateAlreadyAssigned) return new CandidateAlreadyAssignedError();
  if (code === PROCESS_ERROR_CODES.candidateLimit) return new CandidateLimitExceededError(error.message);
  // Sin código en el servidor: el 404 (candidato inexistente) y el 503 (fallo parcial, sin cambios) se distinguen por estado.
  if (error.status === HTTP_NOT_FOUND) return new CandidateNotFoundForProcessError();
  return error.status === HTTP_UNAVAILABLE ? new ProcessServiceUnavailableError() : error;
}
