import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { IProcessListParams } from '../types/processList.types';
import { applyProcessListParams, parseProcessListParams } from '../utils/processListSearchParams';

export interface IUseProcessListParams {
  readonly params:   IProcessListParams;
  readonly setPage:  (page: number) => void;
  /** Cambia el filtro y vuelve a la página 1. */
  readonly setQuery: (q: string) => void;
}

/** page/limit/q viven en la URL (única fuente): F5 y links compartidos conservan página y filtro. */
export function useProcessListParams(): IUseProcessListParams {
  const [search, setSearch] = useSearchParams();
  const params = useMemo(() => parseProcessListParams(search), [search]);
  const setPage = useCallback((page: number): void => {
    setSearch(prev => applyProcessListParams(prev, { ...parseProcessListParams(prev), page }));
  }, [setSearch]);
  const setQuery = useCallback((q: string): void => {
    setSearch(prev => applyProcessListParams(prev, { ...parseProcessListParams(prev), page: 1, q }), { replace: true });
  }, [setSearch]);
  return { params, setPage, setQuery };
}
