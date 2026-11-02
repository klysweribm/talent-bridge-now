import type { ICandidate, ICreateCandidateRequest, ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { ENV } from '@/config/env';
import { httpClient } from '@shared/infrastructure/httpClient';
import type { IExtractCvInput } from '../types/candidates.types';
import { translateCreationError, translateExtractionError, translateUpdateError } from './candidates.translate';
import { mockCreation, mockExtraction, mockUpdate } from './candidates.mock';

export async function extractCv({ file, mode }: IExtractCvInput): Promise<ICvExtractionResult> {
  if (ENV.VITE_CANDIDATES_USE_MOCK) return mockExtraction(file, mode);
  const form = new FormData();
  form.append('file', file);
  form.append('mode', mode);
  try {
    return await httpClient.post<ICvExtractionResult>('/candidates/cv-extraction', form);
  } catch (error) {
    throw translateExtractionError(error);
  }
}

export async function createCandidate(request: ICreateCandidateRequest): Promise<ICandidate> {
  if (ENV.VITE_CANDIDATES_USE_MOCK) return mockCreation(request);
  try {
    return await httpClient.post<ICandidate>('/candidates', request);
  } catch (error) {
    throw translateCreationError(error);
  }
}

/** Reemplaza los campos del perfil `id` (correo, estado y auditoría de alta se conservan en el servidor). */
export async function updateCandidate(id: string, request: ICreateCandidateRequest): Promise<ICandidate> {
  if (ENV.VITE_CANDIDATES_USE_MOCK) return mockUpdate(id, request);
  try {
    return await httpClient.put<ICandidate>(`/candidates/${id}`, request);
  } catch (error) {
    throw translateUpdateError(error);
  }
}
