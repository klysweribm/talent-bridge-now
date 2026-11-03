import { useCallback, useEffect, useState } from 'react';
import { PROCESS_SEARCH_DEBOUNCE_MS } from '../config/processList.constants';
import { normalizeQuery } from '../utils/processListSearchParams';

export interface IUseProcessSearch {
  readonly draft:    string;
  readonly setDraft: (value: string) => void;
  readonly clear:    () => void;
}

/**
 * Texto del buscador (estado de la entrada, no del servidor) con volcado diferido a la URL.
 * `committed` es el `q` de la URL; solo se llama a `commit` cuando el borrador normalizado difiere.
 */
export function useProcessSearch(committed: string | undefined, commit: (q: string) => void): IUseProcessSearch {
  const [draft, setDraft] = useState(committed ?? '');
  useEffect(() => {
    if ((normalizeQuery(draft) ?? '') === (committed ?? '')) return undefined;
    const timer = setTimeout(() => commit(draft), PROCESS_SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [draft, committed, commit]);
  const clear = useCallback((): void => { setDraft(''); commit(''); }, [commit]);
  return { draft, setDraft, clear };
}
