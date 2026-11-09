import { useRef, useState, type MouseEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import { CANDIDATE_PANEL_TEXT } from '../config/candidatePanel.copy';
import { AVAILABLE_CANDIDATES_QUERY_KEY } from '../config/processCreate.constants';
import { useWizardStore } from '../store/wizard.store';

export interface IUseAddCandidateInPanel {
  readonly open:          boolean;
  readonly notice:        string | undefined;
  readonly openPanel:     () => void;
  /** Abre desde un botón y lo recuerda para devolverle el foco al cerrar. */
  readonly openFrom:      (event: MouseEvent<HTMLButtonElement>) => void;
  readonly returnFocusTo: () => HTMLElement | null;
  readonly closePanel:    () => void;
  readonly dismissNotice: () => void;
  readonly onSuccess:     (candidate: ICandidate) => void;
}

function buildNotice(name: string, selected: boolean, max: number | undefined): string {
  if (selected) return CANDIDATE_PANEL_TEXT.noticeSelected(name);
  return max === undefined ? CANDIDATE_PANEL_TEXT.noticeUnselected(name) : CANDIDATE_PANEL_TEXT.noticeLimitFull(name, max);
}

/**
 * Estado del panel «Agregar candidato» y su efecto al guardar. `onSuccess` no depende de que el panel
 * siga montado: lee el store en el momento, invalida la lista, preselecciona si hay cupo y fija el aviso.
 */
export function useAddCandidateInPanel(maxCandidates: number | undefined): IUseAddCandidateInPanel {
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | undefined>();
  const opener = useRef<HTMLElement | null>(null);

  const onSuccess = (candidate: ICandidate): void => {
    void client.invalidateQueries({ queryKey: [AVAILABLE_CANDIDATES_QUERY_KEY] });
    const { candidates, toggleCandidate } = useWizardStore.getState();
    const alreadySelected = candidates.some(item => item.id === candidate.id);
    const hasRoom = maxCandidates !== undefined && candidates.length < maxCandidates;
    if (!alreadySelected && hasRoom) {
      toggleCandidate({ id: candidate.id, fullName: candidate.fullName, primaryRole: candidate.primaryRole }, maxCandidates);
    }
    setNotice(buildNotice(candidate.fullName, alreadySelected || hasRoom, maxCandidates));
    setOpen(false);
  };

  const openFrom = (event: MouseEvent<HTMLButtonElement>): void => { opener.current = event.currentTarget; setOpen(true); };

  return { open, notice, openPanel: () => setOpen(true), openFrom, returnFocusTo: () => opener.current, closePanel: () => setOpen(false), dismissNotice: () => setNotice(undefined), onSuccess };
}
