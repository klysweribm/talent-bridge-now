import { Link } from 'react-router-dom';
import { StatusBadge } from '@shared/components/atoms/StatusBadge';
import type { IAttentionItem } from '../../../types/processes.types';

export interface AttentionRowProps {
  readonly item: IAttentionItem;
}

function describe(item: IAttentionItem): string {
  if (item.kind === 'no_referent') return 'Sin referente asignado';
  return `Feedback vencido hace ${item.hoursOverdue ?? 0} h · ${item.candidateName ?? 'Candidato'}`;
}

export function AttentionRow({ item }: AttentionRowProps): JSX.Element {
  return (
    <li className="p-base bg-surface rounded-lg flex items-center justify-between gap-sm">
      <div className="flex flex-col min-w-0">
        <span className="text-body-md-medium text-text-primary truncate">{item.processTitle}</span>
        <span className="text-label-md text-text-secondary">{describe(item)}</span>
      </div>
      <div className="flex items-center gap-sm flex-shrink-0">
        <StatusBadge variant="danger" label={item.kind === 'no_referent' ? 'Sin referente' : 'Vencido'} />
        <Link to={`/processes/${item.processId}`} className="text-label-md text-primary-interactive hover:underline">
          Resolver
        </Link>
      </div>
    </li>
  );
}
