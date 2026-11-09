import type { IOpportunityDraftRequest, IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { httpClient } from '@shared/infrastructure/httpClient';
import { translateOpportunityDraftError } from './opportunityDraft.translate';

const FILE_FIELD = 'file';

/** `POST /ai/opportunity-draft`: propone los campos de la oportunidad; no persiste nada. */
export async function generateOpportunityDraft(text: string): Promise<IOpportunityDraftResponse> {
  const request: IOpportunityDraftRequest = { text };
  try {
    return await httpClient.post<IOpportunityDraftResponse>('/ai/opportunity-draft', request);
  } catch (error) {
    throw translateOpportunityDraftError(error);
  }
}

/** `POST /ai/opportunity-draft/file`: igual que el texto pero desde un brochure (multipart, campo `file`). No persiste el archivo. */
export async function generateOpportunityDraftFromFile(file: File): Promise<IOpportunityDraftResponse> {
  const form = new FormData();
  form.append(FILE_FIELD, file);
  try {
    return await httpClient.post<IOpportunityDraftResponse>('/ai/opportunity-draft/file', form);
  } catch (error) {
    throw translateOpportunityDraftError(error);
  }
}
