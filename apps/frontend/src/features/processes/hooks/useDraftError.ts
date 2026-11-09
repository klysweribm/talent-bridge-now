import { OpportunityDraftFailure } from '../infrastructure/opportunityDraft.errors';
import { DRAFT_COPY } from '../config/opportunityDraft.copy';

export interface IDraftErrorView {
  readonly error?:    string;
  /** «Reintentar» solo repite el texto: un error de archivo pide elegir otro archivo. */
  readonly canRetry:  boolean;
}

function messageOf(error: Error): string {
  return error instanceof OpportunityDraftFailure ? error.message : DRAFT_COPY.errors.UNKNOWN;
}

/** Une los errores de las dos fuentes (validación local del archivo, mutación de archivo, mutación de texto); gana el más reciente. */
export function deriveDraftError(localFileError: string | undefined, fileError: Error | null, textError: Error | null): IDraftErrorView {
  if (localFileError) return { error: localFileError, canRetry: false };
  if (fileError) return { error: messageOf(fileError), canRetry: false };
  if (textError) return { error: messageOf(textError), canRetry: true };
  return { canRetry: false };
}
