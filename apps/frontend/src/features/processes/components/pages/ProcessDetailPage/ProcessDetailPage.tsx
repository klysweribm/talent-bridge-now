import { Navigate, useParams } from 'react-router-dom';
import { PROCESSES_PATH } from '@/router/paths';
import { ProcessDetailView } from '../../organisms/ProcessDetailView/ProcessDetailView';

export function ProcessDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to={PROCESSES_PATH} replace />;
  return (
    <div className="px-xl pt-lg pb-3xl w-full max-w-content-max mx-auto">
      <ProcessDetailView id={id} />
    </div>
  );
}
