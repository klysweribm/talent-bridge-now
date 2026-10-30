import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RESOURCE_PARAM } from '../config/bench.constants';

export interface IUseSelectedResource {
  readonly code:   string | null;
  readonly select: (code: string) => void;
  readonly close:  () => void;
}

/** Recurso abierto en el drawer, en `?resource=`: no toca filtros ni página. */
export function useSelectedResource(): IUseSelectedResource {
  const [params, setParams] = useSearchParams();

  const select = useCallback((code: string): void => {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      next.set(RESOURCE_PARAM, code);
      return next;
    });
  }, [setParams]);

  const close = useCallback((): void => {
    setParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete(RESOURCE_PARAM);
      return next;
    });
  }, [setParams]);

  return { code: params.get(RESOURCE_PARAM), select, close };
}
