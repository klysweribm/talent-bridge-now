import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { TSeniority } from '@ibm-talent-bridge/shared-types';
import type { IBenchFilters } from '../types/bench.types';
import { applyBenchFilters, parseBenchParams } from '../utils/benchSearchParams';

export interface IUseBenchFilters {
  readonly filters:        IBenchFilters;
  readonly setSkills:      (skills: readonly string[]) => void;
  readonly setSeniority:   (seniority: readonly TSeniority[]) => void;
  readonly setAvailableBy: (date: string | undefined) => void;
  readonly setCountry:     (country: string | undefined) => void;
  readonly setPage:        (page: number) => void;
  readonly clearFilters:   () => void;
}

/** Estado de filtros en la URL (única fuente): F5 y links compartidos lo conservan. */
export function useBenchFilters(): IUseBenchFilters {
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => parseBenchParams(params), [params]);

  // Cambiar un filtro resetea la página (no se pasa `page`); `limit` y params ajenos se conservan.
  const patch = useCallback((change: Partial<IBenchFilters>): void => {
    setParams(prev => applyBenchFilters(prev, { ...parseBenchParams(prev), page: undefined, ...change }), { replace: true });
  }, [setParams]);

  const setPage = useCallback((page: number): void => {
    setParams(prev => applyBenchFilters(prev, { ...parseBenchParams(prev), page }));
  }, [setParams]);

  const clearFilters = useCallback((): void => {
    setParams(prev => applyBenchFilters(prev, {}), { replace: true });
  }, [setParams]);

  return {
    filters,
    setSkills:      useCallback(skills => patch({ skills }), [patch]),
    setSeniority:   useCallback(seniority => patch({ seniority }), [patch]),
    setAvailableBy: useCallback(availableBy => patch({ availableBy }), [patch]),
    setCountry:     useCallback(country => patch({ country }), [patch]),
    setPage,
    clearFilters,
  };
}
