import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { StatusChip } from '@shared/components/atoms/StatusChip/StatusChip';
import { PROCESS_LIST_COPY, formatCandidateCount } from '../../../config/processList.constants';

export interface ProcessDetailHeaderProps {
  readonly process: IProcessDetail;
}

export function ProcessDetailHeader({ process }: ProcessDetailHeaderProps): JSX.Element {
  return (
    <header className="flex flex-col gap-xs">
      <div className="flex flex-wrap items-center gap-md">
        <h1 className="text-headline-md text-text-primary">{process.title}</h1>
        <StatusChip status={process.status} />
      </div>
      <p className="text-body-md text-text-secondary">{process.clientName}</p>
      <p className="text-body-md text-text-secondary">
        {formatCandidateCount(process.candidates.length, process.maxCandidates)} {PROCESS_LIST_COPY.candidatesHeading.toLowerCase()}
      </p>
    </header>
  );
}
