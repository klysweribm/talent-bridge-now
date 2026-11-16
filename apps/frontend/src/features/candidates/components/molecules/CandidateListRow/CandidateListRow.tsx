import { Link } from 'react-router-dom';
import type { ICandidateListItem } from '@ibm-talent-bridge/shared-types';
import { StatusBadge } from '@shared/components/atoms/StatusBadge';
import { TABLE_CELL, TABLE_DATE, TABLE_ROW } from '@shared/components/table.constants';
import { formatShortDate } from '@shared/utils/formatShortDate';
import { PROCESSES_PATH } from '@/router/paths';
import { CANDIDATE_LIST_COPY } from '../../../config/candidateList.constants';

export interface CandidateListRowProps {
  readonly candidate: ICandidateListItem;
}

const MUTED = `${TABLE_CELL} text-carbon-gray-70`;

export function CandidateListRow({ candidate }: CandidateListRowProps): JSX.Element {
  return (
    <tr className={TABLE_ROW}>
      <td className={`${TABLE_CELL} font-semibold`}>{candidate.fullName}</td>
      <td className={MUTED}>{candidate.primaryRole ?? CANDIDATE_LIST_COPY.noRole}</td>
      <td className={MUTED}>{candidate.email}</td>
      <td className={TABLE_CELL}>
        {candidate.processId ? (
          <Link to={`${PROCESSES_PATH}/${encodeURIComponent(candidate.processId)}`} className="hover:underline">
            <StatusBadge variant="info" dot label={CANDIDATE_LIST_COPY.inProcess} />
          </Link>
        ) : (
          <StatusBadge variant="success" dot label={CANDIDATE_LIST_COPY.available} />
        )}
      </td>
      <td className={`${TABLE_CELL} ${TABLE_DATE}`}>{formatShortDate(candidate.createdAt)}</td>
    </tr>
  );
}
