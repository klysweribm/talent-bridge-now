import { Link } from 'react-router-dom';
import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import { Button } from '@shared/components/atoms/Button';
import { RESULT_COPY } from '../../../config/candidates.constants';
import { describeActor } from '../../../utils/formatAudit';

export interface CandidateCreatedProps {
  readonly candidate: ICandidate;
  readonly mode: 'created' | 'updated';
  readonly onRestart: () => void;
  /** Destino y etiqueta del enlace de salida (dependen del origen; los resuelve el organismo). */
  readonly exitTo: string;
  readonly exitLabel: string;
}

export function CandidateCreated({ candidate, mode, onRestart, exitTo, exitLabel }: CandidateCreatedProps): JSX.Element {
  const title = mode === 'updated' ? RESULT_COPY.updated : RESULT_COPY.created;
  return (
    <div role="status" className="flex flex-col items-start gap-sm border-l-[3px] border-carbon-green bg-carbon-green-toast px-base py-[14px] text-body text-carbon-gray-100">
      <p className="font-semibold">{title} {candidate.fullName} ({candidate.email}).</p>
      {mode === 'updated' && candidate.updatedBy && (
        <p className="text-body">{RESULT_COPY.updatedBy} {describeActor(candidate.updatedBy)}</p>
      )}
      <div className="flex gap-sm items-center">
        <Button variant="secondary" size="sm" onClick={onRestart}>Cargar otro candidato</Button>
        <Link to={exitTo} className="text-body text-carbon-blue-60 underline">{exitLabel}</Link>
      </div>
    </div>
  );
}
