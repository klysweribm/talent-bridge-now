import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { IProcessListParams } from '../types/processList.types';
import { applyProcessListParams, parseProcessListParams } from '../utils/processListSearchParams';

export interface IUseProcessListParams {
  readonly params:  IProcessListParams;
  readonly setPage: (page: number) => void;
}

/** page/limit viven en la URL (única fuente): F5 y links compartidos conservan la página. */
export function useProcessListParams(): IUseProcessListParams {
  const [search, setSearch] = useSearchParams();
  const params = useMemo(() => parseProcessListParams(search), [search]);
  const setPage = useCallback((page: number): void => {
    setSearch(prev => applyProcessListParams(prev, { ...parseProcessListParams(prev), page }));
  }, [setSearch]);
  return { params, setPage };
}
