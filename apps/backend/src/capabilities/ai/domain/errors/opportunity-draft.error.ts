import type { TOpportunityDraftErrorCode } from '@ibm-talent-bridge/shared-types';

/** Fallo del borrador ya clasificado. El mensaje nunca lleva el texto del usuario. */
export class OpportunityDraftError extends Error {
  constructor(
    readonly code: TOpportunityDraftErrorCode,
    message: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = 'OpportunityDraftError';
  }
}
