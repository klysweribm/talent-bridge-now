import { HttpError } from '@shared/infrastructure/httpError';
import {
  CANDIDATE_LIMIT_SERVER_PATTERN, HTTP_BAD_REQUEST, HTTP_CONFLICT, HTTP_NOT_FOUND, HTTP_UNAVAILABLE,
} from '../config/processCreate.constants';
import {
  CandidateAlreadyAssignedError, CandidateLimitExceededError, CandidateNotFoundForProcessError, ProcessServiceUnavailableError,
} from './processCreate.errors';

export function translateCreateProcessError(error: unknown): unknown {
  if (!(error instanceof HttpError)) return error;
  switch (error.status) {
    case HTTP_CONFLICT: return new CandidateAlreadyAssignedError();
    case HTTP_NOT_FOUND: return new CandidateNotFoundForProcessError();
    case HTTP_UNAVAILABLE: return new ProcessServiceUnavailableError();
    case HTTP_BAD_REQUEST:
      return CANDIDATE_LIMIT_SERVER_PATTERN.test(error.message) ? new CandidateLimitExceededError(error.message) : error;
    default: return error;
  }
}
