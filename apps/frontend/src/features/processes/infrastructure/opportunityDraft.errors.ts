import { DRAFT_COPY, type TDraftFailureKind } from '../config/opportunityDraft.copy';

/** Fallo al generar el borrador. `serverMessage` solo viene cuando el servidor lo dicta (texto demasiado largo). */
export class OpportunityDraftFailure extends Error {
  public readonly code: TDraftFailureKind;
  public readonly serverMessage?: string;

  public constructor(code: TDraftFailureKind, serverMessage?: string) {
    super(serverMessage ?? DRAFT_COPY.errors[code]);
    this.name = 'OpportunityDraftFailure';
    this.code = code;
    if (serverMessage !== undefined) this.serverMessage = serverMessage;
  }
}
