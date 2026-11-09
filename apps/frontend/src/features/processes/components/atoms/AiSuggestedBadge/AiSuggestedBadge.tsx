import { DRAFT_COPY } from '../../../config/opportunityDraft.copy';

/** Etiqueta «Sugerido por ICA»: texto + forma (no solo color). */
export function AiSuggestedBadge(): JSX.Element {
  return (
    <span className="self-start rounded border border-primary-interactive px-xs text-label-md font-medium text-primary-interactive">
      {DRAFT_COPY.suggestedBadge}
    </span>
  );
}
