import { ModalDialog } from '@shared/components/molecules/ModalDialog';
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
    <ModalDialog
      titleId={TEXT.titleId} descId={TEXT.descId}
      title={extraction ? TEXT.extractionTitle : TEXT.dirtyTitle}
      cancelLabel={TEXT.discard} onCancel={onDiscard} confirmLabel={TEXT.keep} onConfirm={onKeep}
      onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); onKeep(); } }}
    >
      {extraction ? TEXT.extractionDesc : TEXT.dirtyDesc}
    </ModalDialog>
  );
}
