import type { ICandidateListItem } from '@ibm-talent-bridge/shared-types';
import { TABLE_CLASSES, TABLE_HEAD_CELL, TABLE_HEAD_ROW } from '@shared/components/table.constants';
import { TableSkeleton } from '@shared/components/molecules/TableSkeleton';
import { CANDIDATE_COLUMNS, CANDIDATE_LIST_COPY, CANDIDATE_LIST_SKELETON_ROWS } from '../../../config/candidateList.constants';
import { CandidateListRow } from '../CandidateListRow/CandidateListRow';

export interface CandidateTableProps {
  /** `undefined` = cargando. */
  readonly rows: readonly ICandidateListItem[] | undefined;
}

export function CandidateTable({ rows }: CandidateTableProps): JSX.Element {
  return (
    <div className="overflow-x-auto bg-white">
      <table className={`${TABLE_CLASSES} min-w-[760px]`}>
        <thead>
          <tr className={TABLE_HEAD_ROW}>
            {CANDIDATE_COLUMNS.map(column => (
              <th key={column} scope="col" className={TABLE_HEAD_CELL}>{column}</th>
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
