import { Link } from 'react-router-dom';
import type { ICandidateListItem } from '@ibm-talent-bridge/shared-types';
import { StatusBadge } from '@shared/components/atoms/StatusBadge';
import { formatShortDate } from '@shared/utils/formatShortDate';
import { PROCESSES_PATH } from '@/router/paths';
import { CANDIDATE_LIST_COPY } from '../../../config/candidateList.constants';

export interface CandidateListRowProps {
  readonly candidate: ICandidateListItem;
}

const CELL = 'px-base align-middle';
const MUTED = `${CELL} text-body-md text-text-secondary`;

export function CandidateListRow({ candidate }: CandidateListRowProps): JSX.Element {
  return (
    <tr className="h-14 border-b border-outline-variant hover:bg-surface">
      <td className={`${CELL} text-body-md-medium text-text-primary`}>{candidate.fullName}</td>
      <td className={MUTED}>{candidate.primaryRole ?? CANDIDATE_LIST_COPY.noRole}</td>
      <td className={MUTED}>{candidate.email}</td>
      <td className={CELL}>
        {candidate.processId ? (
          <Link to={`${PROCESSES_PATH}/${encodeURIComponent(candidate.processId)}`} className="hover:underline">
            <StatusBadge variant="info" label={CANDIDATE_LIST_COPY.inProcess} />
          </Link>
        ) : (
          <StatusBadge variant="success" label={CANDIDATE_LIST_COPY.available} />
        )}
      </td>
      <td className={MUTED}>{formatShortDate(candidate.createdAt)}</td>
    </tr>
  );
}
