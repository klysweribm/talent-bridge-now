import type { ICreateCandidateRequest } from '@ibm-talent-bridge/shared-types';
import { normalizeName, phoneKey } from '../../domain/candidate-similarity';

const MONGO_DUPLICATE_KEY = 11000;

export const isDuplicateKey = (error: unknown): boolean =>
  typeof error === 'object' && error !== null && (error as { code?: unknown }).code === MONGO_DUPLICATE_KEY;

/** Campos de perfil que un reemplazo sustituye por completo (los ausentes se eliminan). Email, status y processId no están. */
export const PROFILE_FIELDS = [
  'fullName', 'phone', 'linkedIn', 'location', 'primaryRole', 'seniority', 'yearsExperience',
  'skills', 'languages', 'education', 'experience', 'summary',
] as const;

export const searchKeys = (request: ICreateCandidateRequest): { nameKey?: string; phoneKey?: string } => ({
  nameKey: normalizeName(request.fullName) || undefined,
  phoneKey: phoneKey(request.phone),
});
