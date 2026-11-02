import { useState } from 'react';
import type { IProcessCandidateSummary } from '@ibm-talent-bridge/shared-types';
import { AVAILABLE_CANDIDATES_PAGE_SIZE } from '../config/processWizard.constants';
import type { TCandidatesStatus } from '../types/processWizard.types';
import { useAvailableCandidates } from './useAvailableCandidates';

export interface IUseDetailAvailableCandidates {
  readonly status:     TCandidatesStatus;
  readonly rows:       readonly IProcessCandidateSummary[];
  readonly page:       number;
  readonly totalPages: number;
  readonly setPage:    (page: number) => void;
  readonly retry:      () => void;
}

/** Candidatos disponibles paginados para el detalle. El servidor es la única fuente de verdad (sin store). */
export function useDetailAvailableCandidates(): IUseDetailAvailableCandidates {
  const [page, setPage] = useState(1);
  const { data, isPending, isError, refetch } = useAvailableCandidates({ page, limit: AVAILABLE_CANDIDATES_PAGE_SIZE });
  const rows = data?.data ?? [];
  let status: TCandidatesStatus = rows.length === 0 ? 'empty' : 'ready';
  if (isPending) status = 'loading';
  else if (isError) status = 'error';
  return { status, rows, page, totalPages: data?.totalPages ?? 1, setPage, retry: () => { void refetch(); } };
}
