import type { ReactNode } from 'react';
import { DRAFT_COPY } from '../../../config/opportunityDraft.copy';
import type { TDraftMark } from '../../../utils/draftMarks';
import { AiSuggestedBadge } from '../../atoms/AiSuggestedBadge/AiSuggestedBadge';

export interface DraftFieldFrameProps {
  readonly mark?: TDraftMark | undefined;
  readonly children: ReactNode;
}

/** Envuelve un campo del formulario con la marca del borrador de IA: «sugerido» o «por completar» (borde + texto). */
export function DraftFieldFrame({ mark, children }: DraftFieldFrameProps): JSX.Element {
  if (mark === 'missing') {
    return (
      <div className="flex flex-col gap-2xs border-l-[3px] border-carbon-yellow bg-carbon-yellow-tag-bg p-sm">
        {children}
        <span className="text-label font-semibold text-carbon-yellow-tag-text">{DRAFT_COPY.missingHint}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2xs">
      {mark === 'suggested' && <AiSuggestedBadge />}
      {children}
    </div>
  );
}
