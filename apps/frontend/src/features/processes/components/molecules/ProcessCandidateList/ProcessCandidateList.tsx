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
  if (candidates.length === 0) return <p className="text-body text-carbon-gray-70">{PROCESS_LIST_COPY.noCandidates}</p>;
  return (
    <ul className="flex flex-col bg-white border border-carbon-gray-20 divide-y divide-carbon-gray-20">
      {candidates.map(candidate => (
        <li key={candidate.id} className="flex items-center justify-between gap-md min-h-12 px-base py-sm">
          <div className="flex flex-col min-w-0">
            <span className="text-body font-semibold text-carbon-gray-100">{candidate.fullName}</span>
            {candidate.primaryRole && <span className="text-label text-carbon-gray-70">{candidate.primaryRole}</span>}
          </div>
          {onRemove && (
            <Button type="button" variant="outline" size="sm" className="flex-shrink-0" disabled={removeDisabled}
              aria-label={PROCESS_ACTIONS_COPY.candidates.remove(candidate.fullName)} onClick={() => onRemove(candidate.id)}>
              Quitar
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
