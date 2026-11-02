import type { IAddProcessCandidateRequest, IProcessDetail, IUpdateProcessRequest } from '@ibm-talent-bridge/shared-types';
import { httpClient } from '@shared/infrastructure/httpClient';
import { translateProcessActionError } from './processUpdate.translate';

const processPath = (id: string): string => `/processes/${encodeURIComponent(id)}`;

async function run(call: () => Promise<IProcessDetail>): Promise<IProcessDetail> {
  try {
    return await call();
  } catch (error) {
    throw translateProcessActionError(error);
  }
}

export const updateProcess = (id: string, request: IUpdateProcessRequest): Promise<IProcessDetail> =>
  run(() => httpClient.patch<IProcessDetail>(processPath(id), request));

export const addProcessCandidate = (id: string, candidateId: string): Promise<IProcessDetail> => {
  const body: IAddProcessCandidateRequest = { candidateId };
  return run(() => httpClient.post<IProcessDetail>(`${processPath(id)}/candidates`, body));
};

export const removeProcessCandidate = (id: string, candidateId: string): Promise<IProcessDetail> =>
  run(() => httpClient.delete<IProcessDetail>(`${processPath(id)}/candidates/${encodeURIComponent(candidateId)}`));
