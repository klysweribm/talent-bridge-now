import { Link } from 'react-router-dom';
import { PROCESSES_PATH } from '@/router/paths';
import { ListErrorState } from '@shared/components/molecules/ListErrorState';
import { HttpError } from '@shared/infrastructure/httpError';
import { NOT_FOUND_STATUS, PROCESS_LIST_COPY } from '../../../config/processList.constants';
import { useProcessDetail } from '../../../hooks/useProcessDetail';
import { ProcessDetailCard } from '../../molecules/ProcessDetailCard/ProcessDetailCard';
import { ProcessActions } from '../ProcessActions/ProcessActions';

export interface ProcessDetailViewProps {
  readonly id: string;
}

const BACK_CLASS = 'text-body-md-medium text-primary-interactive hover:underline';

export function ProcessDetailView({ id }: ProcessDetailViewProps): JSX.Element {
  const { data, isPending, error, refetch } = useProcessDetail(id);
  const back = <Link to={PROCESSES_PATH} className={BACK_CLASS}>{PROCESS_LIST_COPY.backToList}</Link>;

  if (error instanceof HttpError && error.status === NOT_FOUND_STATUS) {
    return <div role="alert" className="flex flex-col items-center gap-md py-2xl text-center"><p className="text-body-lg text-status-danger">{PROCESS_LIST_COPY.notFound}</p>{back}</div>;
  }
  if (error) {
    return (
      <div className="flex flex-col items-center gap-md">
        <ListErrorState message={PROCESS_LIST_COPY.detailError} retryLabel={PROCESS_LIST_COPY.retryLabel} onRetry={() => void refetch()} />
        {back}
      </div>
    );
  }
  if (isPending || !data) {
    return <div role="status" aria-label={PROCESS_LIST_COPY.detailLoading} className="h-24 rounded bg-surface-high animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-lg">
      {back}
      <ProcessDetailCard process={data} />
      <ProcessActions process={data} />
    </div>
  );
}
