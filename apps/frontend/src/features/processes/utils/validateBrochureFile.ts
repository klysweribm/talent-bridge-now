import { OPPORTUNITY_SOURCE_EXTENSIONS, OPPORTUNITY_SOURCE_MAX_FILE_BYTES } from '../config/opportunitySource.constants';
import { DRAFT_COPY } from '../config/opportunityDraft.copy';

/** Validación previa al envío (el backend es la autoridad). Devuelve el motivo o `null`. */
export function validateBrochureFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!OPPORTUNITY_SOURCE_EXTENSIONS.some(extension => name.endsWith(extension))) return DRAFT_COPY.fileErrors.type;
  if (file.size === 0) return DRAFT_COPY.fileErrors.empty;
  if (file.size > OPPORTUNITY_SOURCE_MAX_FILE_BYTES) return DRAFT_COPY.fileErrors.tooLarge(file.size);
  return null;
}
