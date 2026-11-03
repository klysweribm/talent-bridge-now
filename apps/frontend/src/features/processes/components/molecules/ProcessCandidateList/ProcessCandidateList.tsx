import type { IProcessCandidateSummary } from '@ibm-talent-bridge/shared-types';
import { Button } from '@shared/components/atoms/Button';
import { PROCESS_ACTIONS_COPY } from '../../../config/processActions.copy';
import { PROCESS_LIST_COPY } from '../../../config/processList.constants';

export interface ProcessCandidateListProps {
  readonly candidates: readonly IProcessCandidateSummary[];
  /** Con `onRemove` y sin `removeDisabled`, cada fila ofrece «Quitar». Sin `onRemove` la lista es de solo lectura. */
  readonly onRemove?:       (candidateId: string) => void;
  readonly removeDisabled?: boolean;
}

export function ProcessCandidateList({ candidates, onRemove, removeDisabled = false }: ProcessCandidateListProps): JSX.Element {
  if (candidates.length === 0) return <p className="text-body-md text-text-secondary">{PROCESS_LIST_COPY.noCandidates}</p>;
  return (
    <ul className="flex flex-col bg-surface-card border border-outline-variant rounded-lg divide-y divide-outline-variant">
      {candidates.map(candidate => (
        <li key={candidate.id} className="flex items-center justify-between gap-md px-base py-sm">
          <div className="flex flex-col min-w-0">
            <span className="text-body-md-medium text-text-primary">{candidate.fullName}</span>
            {candidate.primaryRole && <span className="text-body-md text-text-secondary">{candidate.primaryRole}</span>}
          </div>
          {onRemove && (
            <Button type="button" variant="secondary" size="sm" className="min-h-11 flex-shrink-0" disabled={removeDisabled}
              aria-label={PROCESS_ACTIONS_COPY.candidates.remove(candidate.fullName)} onClick={() => onRemove(candidate.id)}>
              Quitar
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
