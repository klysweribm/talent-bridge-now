import type { ICandidateActor } from '@ibm-talent-bridge/shared-types';
import { AUDIT_COPY } from '../../../config/candidates.constants';
import { describeActor, describeUpdateCount, formatUpdatedAt } from '../../../utils/formatAudit';

export interface AuditSummaryProps {
  readonly updatedAt: string;
  readonly updatedBy?: ICandidateActor;
  readonly updateCount: number;
}

/** Última actualización, quién y cuántas veces; siempre con texto, nunca solo color. */
export function AuditSummary({ updatedAt, updatedBy, updateCount }: AuditSummaryProps): JSX.Element {
  return (
    <ul className="flex flex-col gap-2xs text-body-md text-text-primary">
      <li>{AUDIT_COPY.lastUpdate} {formatUpdatedAt(updatedAt)}</li>
      <li>{updatedBy ? `${AUDIT_COPY.by} ${describeActor(updatedBy)}` : AUDIT_COPY.noActor}</li>
      <li>{describeUpdateCount(updateCount)}</li>
    </ul>
  );
}
