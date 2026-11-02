import type { ICandidate, ICvExtractionUnavailable } from '@ibm-talent-bridge/shared-types';
import { HttpError } from '@shared/infrastructure/httpError';
import { CandidateNotFoundError, CvExtractionUnavailableError, CvInvalidFileError, DuplicateCandidateError } from './candidates.errors';

const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_UNAVAILABLE = 503;

function asRecord(body: unknown): Record<string, unknown> {
  return typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};
}

export function translateExtractionError(error: unknown): unknown {
  if (!(error instanceof HttpError)) return error;
  if (error.status === HTTP_UNAVAILABLE) {
    return new CvExtractionUnavailableError((asRecord(error.body) as unknown as ICvExtractionUnavailable).reason);
  }
  return error.status === HTTP_BAD_REQUEST ? new CvInvalidFileError(error.message) : error;
}

export function translateCreationError(error: unknown): unknown {
  if (!(error instanceof HttpError) || error.status !== HTTP_BAD_REQUEST) return error;
  const existing = asRecord(error.body).existing;
  return existing ? new DuplicateCandidateError(existing as ICandidate) : error;
}

export function translateUpdateError(error: unknown): unknown {
  return error instanceof HttpError && error.status === HTTP_NOT_FOUND ? new CandidateNotFoundError() : error;
}
