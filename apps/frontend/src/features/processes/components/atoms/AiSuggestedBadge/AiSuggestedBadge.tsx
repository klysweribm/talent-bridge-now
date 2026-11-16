import { DRAFT_COPY } from '../../../config/opportunityDraft.copy';

/** Etiqueta «Sugerido por ICA»: texto + forma (no solo color). */
export function AiSuggestedBadge(): JSX.Element {
  return (
    <span className="inline-flex h-5 items-center self-start rounded-pill bg-carbon-blue-20 px-sm text-label text-carbon-blue-80">
      {DRAFT_COPY.suggestedBadge}
    </span>
  );
}
