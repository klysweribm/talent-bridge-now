import { useState } from 'react';
import type { IProcessCandidateSummary } from '@ibm-talent-bridge/shared-types';
import { AVAILABLE_CANDIDATES_PAGE_SIZE } from '../config/processWizard.constants';
import type { TCandidatesStatus } from '../types/processWizard.types';
import { useWizardStore } from '../store/wizard.store';
import { useAvailableCandidates } from './useAvailableCandidates';
import { useProcessLimits } from './useProcessLimits';

export interface IUseCandidatesStep {
  readonly status:        TCandidatesStatus;
  readonly rows:          readonly IProcessCandidateSummary[];
  readonly checkedIds:    readonly string[];
  readonly selectedCount: number;
  /** `undefined` mientras el backend no responde el tope. */
  readonly maxCandidates: number | undefined;
  readonly limitReached:  boolean;
  readonly page:          number;
  readonly totalPages:    number;
  readonly setPage:       (page: number) => void;
  readonly toggle:        (candidate: IProcessCandidateSummary) => void;
  readonly retry:         () => void;
}

function resolveStatus(isPending: boolean, isError: boolean, count: number): TCandidatesStatus {
  if (isPending) return 'loading';
  if (isError) return 'error';
  return count === 0 ? 'empty' : 'ready';
}

export function useCandidatesStep(): IUseCandidatesStep {
  const [page, setPage] = useState(1);
  const available = useAvailableCandidates({ page, limit: AVAILABLE_CANDIDATES_PAGE_SIZE });
  const maxCandidates = useProcessLimits().data?.maxCandidates;
  const selected = useWizardStore(state => state.candidates);
  const toggleCandidate = useWizardStore(state => state.toggleCandidate);
  const rows = available.data?.data ?? [];

  return {
    status: resolveStatus(available.isPending, available.isError, rows.length),
    rows,
    checkedIds: selected.map(item => item.id),
    selectedCount: selected.length,
    maxCandidates,
    limitReached: maxCandidates !== undefined && selected.length >= maxCandidates,
    page,
    totalPages: available.data?.totalPages ?? 1,
    setPage,
    toggle: candidate => { if (maxCandidates !== undefined) toggleCandidate(candidate, maxCandidates); },
    retry: () => { void available.refetch(); },
  };
}
