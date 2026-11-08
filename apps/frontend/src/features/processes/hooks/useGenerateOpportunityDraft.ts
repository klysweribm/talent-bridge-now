import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { generateOpportunityDraft } from '../infrastructure/opportunityDraft.infra';

/** Pide un borrador a la IA. No persiste nada: el resultado solo alimenta el formulario. */
export function useGenerateOpportunityDraft(): UseMutationResult<IOpportunityDraftResponse, Error, string> {
  return useMutation<IOpportunityDraftResponse, Error, string>({ mutationFn: text => generateOpportunityDraft(text) });
}
