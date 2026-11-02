import type { ICandidate, ICreateCandidateRequest } from '@ibm-talent-bridge/shared-types';
import { CandidateNotFoundError, DuplicateCandidateError } from './candidates.errors';
import { MOCK_ACTOR, MOCK_EXACT_MATCH, MOCK_NOT_FOUND_ID } from './candidates.mock.fixtures';

export { mockExtraction } from './candidates.mock.extraction';
export {
  MOCK_CLASSIC_NOT_COMPLETED_MARKER, MOCK_EXACT_MATCH_FILE_MARKER, MOCK_NOT_FOUND_ID, MOCK_SIMILAR_MATCH_FILE_MARKER,
  MOCK_UNAVAILABLE_FILE_MARKER,
} from './candidates.mock.fixtures';

/** Disparadores deterministas del mock: nombre de archivo / correo. Solo datos inventados. */
export const MOCK_DUPLICATE_EMAIL = 'duplicado@example.com';

export function mockCreation(request: ICreateCandidateRequest): ICandidate {
  const now = new Date().toISOString();
  if (request.email === MOCK_DUPLICATE_EMAIL) {
    throw new DuplicateCandidateError({
      ...request, id: 'mock-existing', status: 'tentative', fullName: 'Candidata Existente', createdAt: now, updatedAt: now, updateCount: 0,
    });
  }
  return { ...request, id: 'mock-new', status: 'tentative', createdAt: now, updatedAt: now, updateCount: 0 };
}

export function mockUpdate(id: string, request: ICreateCandidateRequest): ICandidate {
  if (id === MOCK_NOT_FOUND_ID) throw new CandidateNotFoundError();
  const now = new Date().toISOString();
  return {
    ...request, id, status: 'tentative', createdAt: MOCK_EXACT_MATCH.updatedAt, updatedAt: now,
    updatedBy: MOCK_ACTOR, updateCount: MOCK_EXACT_MATCH.updateCount + 1,
  };
}
