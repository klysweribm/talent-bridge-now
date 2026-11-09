import { Button } from '@shared/components/atoms/Button';
import { DISCARD_DIALOG_TEXT as TEXT } from '../../../config/candidatePanel.copy';
import type { TDiscardKind } from '../../../hooks/useCandidatePanelGuard';

export interface DiscardCandidateDialogProps {
  readonly kind:      TDiscardKind;
  readonly onKeep:    () => void;
  readonly onDiscard: () => void;
}

/** Confirmación anidada en el panel; su Escape cierra solo la confirmación. */
export function DiscardCandidateDialog({ kind, onKeep, onDiscard }: DiscardCandidateDialogProps): JSX.Element {
  const extraction = kind === 'extraction';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-text-primary/40 p-base">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={TEXT.titleId}
        aria-describedby={TEXT.descId}
        onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); onKeep(); } }}
        className="flex w-full max-w-[420px] flex-col gap-base rounded-lg bg-surface-card p-xl shadow-modal"
      >
        <h2 id={TEXT.titleId} className="text-headline-md text-text-primary">{extraction ? TEXT.extractionTitle : TEXT.dirtyTitle}</h2>
        <p id={TEXT.descId} className="text-body-md text-text-secondary">{extraction ? TEXT.extractionDesc : TEXT.dirtyDesc}</p>
        <div className="flex justify-end gap-sm">
          <Button variant="secondary" onClick={onDiscard}>{TEXT.discard}</Button>
          <Button autoFocus onClick={onKeep}>{TEXT.keep}</Button>
        </div>
      </div>
    </div>
  );
}
