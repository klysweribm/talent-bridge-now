import { useState } from 'react';
import type { ICandidateCreateFormState } from '@features/candidates/hooks/useReportFormState';

export type TDiscardKind = 'dirty' | 'extraction';

export interface IUseCandidatePanelGuard {
  readonly onStateChange: (state: ICandidateCreateFormState) => void;
  /** false = el cierre no procede (guardado en curso o a la espera de confirmación). */
  readonly guardClose:   () => boolean;
  readonly confirm:      TDiscardKind | undefined;
  readonly keepEditing:  () => void;
}

const IDLE: ICandidateCreateFormState = { busy: false, dirty: false };

/** Regla de cierre única: guardando bloquea; extrayendo o con datos pide confirmación; sin datos cierra. */
export function useCandidatePanelGuard(): IUseCandidatePanelGuard {
  const [state, setState] = useState<ICandidateCreateFormState>(IDLE);
  const [confirm, setConfirm] = useState<TDiscardKind | undefined>();

  const guardClose = (): boolean => {
    if (state.saving) return false;
    if (state.busy) { setConfirm('extraction'); return false; }
    if (state.dirty) { setConfirm('dirty'); return false; }
    return true;
  };

  return { onStateChange: setState, guardClose, confirm, keepEditing: () => setConfirm(undefined) };
}
