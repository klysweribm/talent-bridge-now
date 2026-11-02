import type { IProcessCandidateSummary } from '@ibm-talent-bridge/shared-types';
import { ListErrorState } from '@shared/components/molecules/ListErrorState';
import { CANDIDATES_STEP_TEXT, SKELETON_ROWS, WIZARD_TEXT } from '../../../config/processWizard.constants';
import type { TCandidatesStatus } from '../../../types/processWizard.types';
import { CandidateCheckbox } from '../CandidateCheckbox';

export interface CandidatesBodyProps {
  readonly status:      TCandidatesStatus;
  readonly rows:        readonly IProcessCandidateSummary[];
  readonly checkedIds:  readonly string[];
  /** Casillas sin marcar deshabilitadas (tope alcanzado o tope aún desconocido). */
  readonly lockUnchecked: boolean;
  readonly onToggle:    (candidate: IProcessCandidateSummary) => void;
  readonly onRetry:     () => void;
}

export function CandidatesBody({ status, rows, checkedIds, lockUnchecked, onToggle, onRetry }: CandidatesBodyProps): JSX.Element {
  if (status === 'loading') {
    return (
      <div role="status" aria-label={CANDIDATES_STEP_TEXT.loading} className="flex flex-col gap-sm">
        {Array.from({ length: SKELETON_ROWS }, (_, index) => <div key={index} className="h-14 rounded bg-surface-high animate-pulse" />)}
      </div>
    );
  }
  if (status === 'error') {
    return <ListErrorState message={CANDIDATES_STEP_TEXT.error} retryLabel={WIZARD_TEXT.retry} onRetry={onRetry} />;
  }
  if (status === 'empty') return <p className="text-body-lg text-text-secondary">{CANDIDATES_STEP_TEXT.empty}</p>;
  return (
    <ul className="flex flex-col divide-y divide-surface-high rounded-lg border border-surface-high bg-surface-card">
      {rows.map(candidate => {
        const checked = checkedIds.includes(candidate.id);
        return (
          <li key={candidate.id}>
            <CandidateCheckbox
              label={CANDIDATES_STEP_TEXT.rowLabel(candidate.fullName, candidate.primaryRole)}
              checked={checked}
              disabled={!checked && lockUnchecked}
              onToggle={() => onToggle(candidate)}
            />
          </li>
        );
      })}
    </ul>
  );
}
