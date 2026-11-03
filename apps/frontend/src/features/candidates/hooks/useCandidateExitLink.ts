import { useLocation } from 'react-router-dom';
import { CANDIDATES_PATH, NEW_PROCESS_PATH } from '@/router/paths';
import { CANDIDATE_EXIT_LINKS, NEW_PROCESS_ORIGIN } from '../config/candidateList.constants';
import type { ICandidateNavState } from '../types/candidateList.types';

export interface ICandidateExitLink {
  readonly to:    string;
  readonly label: string;
}

/** Enlace de salida de «Candidato creado»: depende del origen de navegación (react-router `state`). */
export function useCandidateExitLink(): ICandidateExitLink {
  const state = useLocation().state as ICandidateNavState | null;
  return state?.from === NEW_PROCESS_ORIGIN
    ? { to: NEW_PROCESS_PATH, label: CANDIDATE_EXIT_LINKS.newProcess.label }
    : { to: CANDIDATES_PATH, label: CANDIDATE_EXIT_LINKS.list.label };
}
