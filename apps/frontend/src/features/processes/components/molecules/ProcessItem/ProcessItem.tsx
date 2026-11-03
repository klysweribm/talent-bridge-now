import { Link } from 'react-router-dom';
import type { IProcessListItem } from '@ibm-talent-bridge/shared-types';
import { StatusChip } from '@shared/components/atoms/StatusChip/StatusChip';
import { Icon } from '@shared/components/atoms/Icon/Icon';
import { PROCESSES_PATH } from '@/router/paths';
import { PROCESS_LIST_COPY, formatCandidatesLink, formatProcessSubtitle } from '../../../config/processList.constants';
import { ProcessReferents } from '../ProcessReferents/ProcessReferents';

export interface ProcessItemProps {
  readonly process: IProcessListItem;
}

export function ProcessItem({ process }: ProcessItemProps): JSX.Element {
  const href = `${PROCESSES_PATH}/${encodeURIComponent(process.id)}`;
  return (
    <li className="py-base flex flex-col sm:flex-row sm:items-center justify-between gap-md border-b border-surface-high last:border-b-0">
      <div className="flex flex-col gap-xs min-w-0">
        <div className="flex items-center gap-sm min-w-0">
          <span className="text-title-md font-bold text-text-primary truncate">{process.title}</span>
          <StatusChip status={process.status} />
        </div>
        <span className="text-body-md text-text-secondary">{formatProcessSubtitle(process)}</span>
        <div className="flex flex-wrap items-center gap-x-base gap-y-xs">
          <ProcessReferents referents={process.technicalRefs} />
          <span className="inline-flex items-center gap-xs text-body-md text-text-secondary">
            <Icon name="group" size={16} />
            {formatCandidatesLink(process.candidateCount)}
          </span>
        </div>
      </div>
      <Link
        to={href}
        aria-label={`${PROCESS_LIST_COPY.viewProcess} de ${process.title}`}
        className="inline-flex items-center justify-center gap-xs min-h-11 px-base rounded border border-outline-variant text-label-md text-primary-interactive hover:bg-surface-low whitespace-nowrap flex-shrink-0"
      >
        {PROCESS_LIST_COPY.viewProcess}
        <Icon name="chevron_right" size={16} />
      </Link>
    </li>
  );
}
