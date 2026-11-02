import type { ICandidateListItem } from '@ibm-talent-bridge/shared-types';
import { TableSkeleton } from '@shared/components/molecules/TableSkeleton';
import { CANDIDATE_COLUMNS, CANDIDATE_LIST_COPY, CANDIDATE_LIST_SKELETON_ROWS } from '../../../config/candidateList.constants';
import { CandidateListRow } from '../CandidateListRow/CandidateListRow';

export interface CandidateTableProps {
  /** `undefined` = cargando. */
  readonly rows: readonly ICandidateListItem[] | undefined;
}

export function CandidateTable({ rows }: CandidateTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto bg-surface-card border border-outline-variant rounded-lg">
      <table className="w-full text-left">
        <thead>
          <tr className="h-10 border-b border-outline-variant">
            {CANDIDATE_COLUMNS.map(column => (
              <th key={column} scope="col" className="px-base text-label-md text-text-secondary">{column}</th>
            ))}
          </tr>
        </thead>
        {rows ? (
          <tbody>{rows.map(candidate => <CandidateListRow key={candidate.id} candidate={candidate} />)}</tbody>
        ) : (
          <TableSkeleton label={CANDIDATE_LIST_COPY.loadingLabel} columnCount={CANDIDATE_COLUMNS.length} rows={CANDIDATE_LIST_SKELETON_ROWS} />
        )}
      </table>
    </div>
  );
}
