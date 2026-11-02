import type { IProcessCandidateSummary } from '@ibm-talent-bridge/shared-types';
import { PROCESS_LIST_COPY } from '../../../config/processList.constants';

export interface ProcessCandidateListProps {
  readonly candidates: readonly IProcessCandidateSummary[];
}

export function ProcessCandidateList({ candidates }: ProcessCandidateListProps): JSX.Element {
  if (candidates.length === 0) return <p className="text-body-md text-text-secondary">{PROCESS_LIST_COPY.noCandidates}</p>;
  return (
    <ul className="flex flex-col bg-surface-card border border-outline-variant rounded-lg divide-y divide-outline-variant">
      {candidates.map(candidate => (
        <li key={candidate.id} className="flex flex-col px-base py-sm">
          <span className="text-body-md-medium text-text-primary">{candidate.fullName}</span>
          {candidate.primaryRole && <span className="text-body-md text-text-secondary">{candidate.primaryRole}</span>}
        </li>
      ))}
    </ul>
  );
}
