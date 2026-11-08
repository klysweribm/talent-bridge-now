import type { IOpportunityDraftRequest, IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { httpClient } from '@shared/infrastructure/httpClient';
import { translateOpportunityDraftError } from './opportunityDraft.translate';

/** `POST /ai/opportunity-draft`: propone los campos de la oportunidad; no persiste nada. */
export async function generateOpportunityDraft(text: string): Promise<IOpportunityDraftResponse> {
  const request: IOpportunityDraftRequest = { text };
  try {
    return await httpClient.post<IOpportunityDraftResponse>('/ai/opportunity-draft', request);
  } catch (error) {
    throw translateOpportunityDraftError(error);
  }
}
