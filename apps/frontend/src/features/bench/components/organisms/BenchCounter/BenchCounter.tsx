import { useBenchFilters } from '../../../hooks/useBenchFilters';
import { useBenchList } from '../../../hooks/useBenchList';
import { toBenchQuery } from '../../../utils/toBenchQuery';

export function BenchCounter(): JSX.Element | null {
  const { filters } = useBenchFilters();
  const { data } = useBenchList(toBenchQuery(filters));
  if (!data) return null;

  return (
    <p className="text-body-md text-text-secondary">
      {data.total} {data.total === 1 ? 'recurso' : 'recursos'} en banca
    </p>
  );
}
