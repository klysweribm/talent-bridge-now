import { Link } from 'react-router-dom';
import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import { Button } from '@shared/components/atoms/Button';
import { RESULT_COPY } from '../../../config/candidates.constants';
import { describeActor } from '../../../utils/formatAudit';

export interface CandidateCreatedProps {
  readonly candidate: ICandidate;
  readonly mode: 'created' | 'updated';
  readonly onRestart: () => void;
}

export function CandidateCreated({ candidate, mode, onRestart }: CandidateCreatedProps): JSX.Element {
  const title = mode === 'updated' ? RESULT_COPY.updated : RESULT_COPY.created;
  return (
    <div role="status" className="flex flex-col items-start gap-sm p-md rounded border border-status-success bg-status-success-bg">
      <p className="text-body-md-medium text-text-primary">{title} {candidate.fullName} ({candidate.email}).</p>
      {mode === 'updated' && candidate.updatedBy && (
        <p className="text-body-md text-text-primary">{RESULT_COPY.updatedBy} {describeActor(candidate.updatedBy)}</p>
      )}
      <div className="flex gap-sm items-center">
        <Button variant="secondary" onClick={onRestart}>Cargar otro candidato</Button>
        <Link to="/processes/new" className="text-body-md text-primary-interactive underline">Volver al nuevo proceso</Link>
      </div>
    </div>
  );
}
