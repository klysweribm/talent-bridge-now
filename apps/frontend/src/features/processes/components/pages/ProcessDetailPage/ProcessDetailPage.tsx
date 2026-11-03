import { Navigate, useParams } from 'react-router-dom';
import { PROCESSES_PATH } from '@/router/paths';
import { ProcessDetailView } from '../../organisms/ProcessDetailView/ProcessDetailView';

export function ProcessDetailPage(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  if (!id) return <Navigate to={PROCESSES_PATH} replace />;
  return (
    <div className="px-xl py-lg w-full max-w-7xl mx-auto">
      <ProcessDetailView id={id} />
    </div>
  );
}
