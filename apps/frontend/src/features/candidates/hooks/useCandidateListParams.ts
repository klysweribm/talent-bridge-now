import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TCandidateAssignment } from '@ibm-talent-bridge/shared-types';
import type { ICandidateListParams } from '../types/candidateList.types';
import { applyCandidateListParams, parseCandidateListParams } from '../utils/candidateListSearchParams';

export interface IUseCandidateListParams {
  readonly params:        ICandidateListParams;
  readonly setPage:       (page: number) => void;
  /** Cambiar de filtro vuelve a la página 1. */
  readonly setAssignment: (assignment: TCandidateAssignment | undefined) => void;
}

/** page/limit/assignment viven en la URL (única fuente): F5 y links compartidos los conservan. */
export function useCandidateListParams(): IUseCandidateListParams {
  const [search, setSearch] = useSearchParams();
  const params = useMemo(() => parseCandidateListParams(search), [search]);
  const setPage = useCallback((page: number): void => {
    setSearch(prev => applyCandidateListParams(prev, { ...parseCandidateListParams(prev), page }));
  }, [setSearch]);
  const setAssignment = useCallback((assignment: TCandidateAssignment | undefined): void => {
    setSearch(prev => applyCandidateListParams(prev, { ...parseCandidateListParams(prev), page: 1, assignment }));
  }, [setSearch]);
  return { params, setPage, setAssignment };
}
