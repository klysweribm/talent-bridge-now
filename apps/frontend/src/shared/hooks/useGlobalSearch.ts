import { useMemo, useState } from 'react';
import { BENCH_PAGE_LIMIT_MAX } from '@features/bench/config/bench.constants';
import { useBenchList } from '@features/bench/hooks/useBenchList';
import { buildSearchGroups, type ISearchGroup } from '@shared/utils/buildSearchGroups';

export interface IUseGlobalSearch {
  readonly query:    string;
  readonly setQuery: (value: string) => void;
  readonly groups:   readonly ISearchGroup[];
  readonly isError:  boolean;
}

const BENCH_QUERY = { limit: BENCH_PAGE_LIMIT_MAX } as const;

/** Búsqueda global del shell: reutiliza el hook de banca (datos mock/API de esa feature) y filtra en cliente. */
export function useGlobalSearch(): IUseGlobalSearch {
  const [query, setQuery] = useState('');
  const { data, isError } = useBenchList(BENCH_QUERY);
  const groups = useMemo(() => buildSearchGroups(data?.data ?? [], query), [data, query]);
  return { query, setQuery, groups, isError };
}
