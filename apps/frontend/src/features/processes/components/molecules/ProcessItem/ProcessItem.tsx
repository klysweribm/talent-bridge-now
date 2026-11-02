import { Link } from 'react-router-dom';
import type { IProcessListItem } from '@ibm-talent-bridge/shared-types';
import { PROCESSES_PATH } from '@/router/paths';
import { PROCESS_LIST_COPY, formatProcessSubtitle } from '../../../config/processList.constants';

export interface ProcessItemProps {
  readonly process: IProcessListItem;
}

export function ProcessItem({ process }: ProcessItemProps): JSX.Element {
  return (
    <li className="p-base bg-surface rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
      <div className="flex flex-col min-w-0">
        <span className="text-title-md text-text-primary truncate">{process.title}</span>
        <span className="text-body-md text-text-secondary">{formatProcessSubtitle(process)}</span>
      </div>
      <Link
        to={`${PROCESSES_PATH}/${encodeURIComponent(process.id)}`}
        aria-label={`${PROCESS_LIST_COPY.detailLinkLabel} de ${process.title}`}
        className="text-label-md text-primary-interactive hover:underline whitespace-nowrap flex-shrink-0"
      >
        {PROCESS_LIST_COPY.detailLinkLabel}
      </Link>
    </li>
  );
}
