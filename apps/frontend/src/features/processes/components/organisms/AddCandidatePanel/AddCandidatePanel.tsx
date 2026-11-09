import { lazy, Suspense } from 'react';
import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import { SidePanel } from '@shared/components/organisms/SidePanel/SidePanel';
import { useSidePanel } from '@shared/components/organisms/SidePanel/SidePanelContext';
import type { TReturnFocusTo } from '@shared/hooks/useDialogFocus';
import { CANDIDATE_PANEL_TEXT as TEXT } from '../../../config/candidatePanel.copy';
import { useCandidatePanelGuard, type IUseCandidatePanelGuard } from '../../../hooks/useCandidatePanelGuard';
import { DiscardCandidateDialog } from '../../molecules/DiscardCandidateDialog/DiscardCandidateDialog';

// Carga diferida: el módulo de candidatos solo se descarga si el usuario abre el panel.
const CandidateCreateForm = lazy(() => import('@features/candidates/components/organisms/CandidateCreateForm/CandidateCreateForm')
  .then(module => ({ default: module.CandidateCreateForm })));

export interface AddCandidatePanelProps {
  readonly onClose:        () => void;
  readonly onSuccess:      (candidate: ICandidate) => void;
  readonly returnFocusTo:  TReturnFocusTo;
}

function PanelBody({ guard, onSuccess }: { readonly guard: IUseCandidatePanelGuard; readonly onSuccess: AddCandidatePanelProps['onSuccess'] }): JSX.Element {
  const { forceClose } = useSidePanel();
  return (
    <>
      <Suspense fallback={<p role="status" className="text-body-md text-text-secondary">{TEXT.loading}</p>}>
        <CandidateCreateForm stacked onSuccess={onSuccess} onStateChange={guard.onStateChange} />
      </Suspense>
      {guard.confirm && <DiscardCandidateDialog kind={guard.confirm} onKeep={guard.keepEditing} onDiscard={forceClose} />}
    </>
  );
}

/** Panel lateral «Agregar candidato»: formulario de candidatos con regla de cierre única. */
export function AddCandidatePanel({ onClose, onSuccess, returnFocusTo }: AddCandidatePanelProps): JSX.Element {
  const guard = useCandidatePanelGuard();
  return (
    <SidePanel
      title={TEXT.title}
      titleId={TEXT.titleId}
      closeLabel={TEXT.close}
      width="lg"
      onClose={onClose}
      guardClose={guard.guardClose}
      returnFocusTo={returnFocusTo}
    >
      <PanelBody guard={guard} onSuccess={onSuccess} />
    </SidePanel>
  );
}
