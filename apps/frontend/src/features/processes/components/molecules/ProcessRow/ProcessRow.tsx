import { Link } from 'react-router-dom';
import { StageChip } from '@shared/components/atoms/StageChip';
import { StatusBadge } from '@shared/components/atoms/StatusBadge';
import type { IProcessSummary } from '../../../types/processes.types';

export interface ProcessRowProps {
  readonly process: IProcessSummary;
}

export function ProcessRow({ process }: ProcessRowProps): JSX.Element {
  const atRisk = process.health === 'at_risk';

  return (
    <li className="p-base bg-surface rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
      <div className="flex flex-col min-w-0">
        <span className="text-title-md text-text-primary truncate">{process.title}</span>
        <span className="text-body-md text-text-secondary">
          {process.client} · {process.candidatesCount} candidatos
        </span>
      </div>
      <div className="flex items-center gap-sm flex-shrink-0">
        <StageChip stage={process.stage} />
        <StatusBadge variant={atRisk ? 'danger' : 'success'} label={atRisk ? 'En riesgo' : 'En tiempo'} dot />
        <Link
          to={`/processes/${process.id}`}
          aria-label={`Ver detalle de ${process.title}`}
          className="text-label-md text-primary-interactive hover:underline whitespace-nowrap"
        >
          Ver detalle
        </Link>
      </div>
    </li>
  );
}
