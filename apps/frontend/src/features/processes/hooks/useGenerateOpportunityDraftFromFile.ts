import { useMutation, type UseMutationResult } from '@tanstack/react-query';
import type { IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { generateOpportunityDraftFromFile } from '../infrastructure/opportunityDraft.infra';

/** Pide un borrador a la IA desde un brochure. No persiste nada ni retiene el archivo. */
export function useGenerateOpportunityDraftFromFile(): UseMutationResult<IOpportunityDraftResponse, Error, File> {
  return useMutation<IOpportunityDraftResponse, Error, File>({ mutationFn: file => generateOpportunityDraftFromFile(file) });
}
