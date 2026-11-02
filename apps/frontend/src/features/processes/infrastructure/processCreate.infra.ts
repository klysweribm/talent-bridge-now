import type {
  ICreateProcessRequest, IProcess, IProcessCandidateSummary, IProcessLimits, IUserOption, PaginatedResponse,
} from '@ibm-talent-bridge/shared-types';
import { httpClient } from '@shared/infrastructure/httpClient';
import type { IPageParams, TUserOptionRole } from '../types/processCreate.types';
import { translateCreateProcessError } from './processCreate.translate';

function withQuery(path: string, entries: Readonly<Record<string, string | number | undefined>>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(entries)) {
    if (value) qs.set(key, String(value));
  }
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
}

export async function createProcess(request: ICreateProcessRequest): Promise<IProcess> {
  try {
    return await httpClient.post<IProcess>('/processes', request);
  } catch (error) {
    throw translateCreateProcessError(error);
  }
}

export function fetchAvailableCandidates(params: IPageParams = {}): Promise<PaginatedResponse<IProcessCandidateSummary>> {
  return httpClient.get<PaginatedResponse<IProcessCandidateSummary>>(
    withQuery('/candidates/available', { page: params.page, limit: params.limit }),
  );
}

export function fetchUserOptions(role: TUserOptionRole, params: IPageParams = {}): Promise<PaginatedResponse<IUserOption>> {
  return httpClient.get<PaginatedResponse<IUserOption>>(
    withQuery('/users', { role, page: params.page, limit: params.limit }),
  );
}

export function fetchProcessLimits(): Promise<IProcessLimits> {
  return httpClient.get<IProcessLimits>('/processes/limits');
}
