import { create } from 'zustand';
import type { IProcessCandidateSummary } from '@ibm-talent-bridge/shared-types';
import type { TProcessCreateStep } from '../config/processCreate.constants';
import type { IProcessDataDraft } from '../types/processCreate.types';

interface IWizardState {
  readonly step:       TProcessCreateStep;
  readonly data:       IProcessDataDraft;
  readonly candidates: readonly IProcessCandidateSummary[];
}

interface IWizardActions {
  setStep:         (step: TProcessCreateStep) => void;
  saveData:        (data: IProcessDataDraft) => void;
  /** Agrega o quita; agregar se ignora si ya se alcanzó `max` (el tope lo decide quien llama). */
  toggleCandidate: (candidate: IProcessCandidateSummary, max: number) => void;
  removeCandidate: (id: string) => void;
  reset:           () => void;
}

const INITIAL_STATE: IWizardState = {
  step:       'data',
  data:       { title: '', clientName: '' },
  candidates: [],
};

// Sin persistencia: el borrador del asistente vive solo mientras la pestaña está en el flujo.
export const useWizardStore = create<IWizardState & IWizardActions>()((set) => ({
  ...INITIAL_STATE,

  setStep: (step) => set(() => ({ step })),

  saveData: (data) => set(() => ({ data })),

  toggleCandidate: (candidate, max) =>
    set((state) => {
      if (state.candidates.some(item => item.id === candidate.id)) {
        return { candidates: state.candidates.filter(item => item.id !== candidate.id) };
      }
      return state.candidates.length >= max ? state : { candidates: [...state.candidates, candidate] };
    }),

  removeCandidate: (id) => set((state) => ({ candidates: state.candidates.filter(item => item.id !== id) })),

  reset: () => set(() => ({ ...INITIAL_STATE })),
}));
