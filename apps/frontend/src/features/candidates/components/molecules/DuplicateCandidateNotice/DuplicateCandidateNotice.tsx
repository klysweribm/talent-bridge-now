import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import { Button } from '@shared/components/atoms/Button';
import { DUPLICATE_COPY } from '../../../config/candidates.constants';

export interface DuplicateCandidateNoticeProps {
  readonly existing: ICandidate;
  readonly onUpdateExisting: () => void;
}

export function DuplicateCandidateNotice({ existing, onUpdateExisting }: DuplicateCandidateNoticeProps): JSX.Element {
  return (
    <div role="alert" className="flex flex-col items-start gap-xs p-md rounded border border-status-danger bg-status-danger-bg">
      <p className="text-body-md-medium text-text-primary">{DUPLICATE_COPY.title}</p>
      <p className="text-body-md text-text-primary">{existing.fullName} · {existing.email}</p>
      <p className="text-body-md text-text-primary">{DUPLICATE_COPY.emailNote}</p>
      <Button type="button" variant="secondary" onClick={onUpdateExisting}>{DUPLICATE_COPY.updateExisting}</Button>
    </div>
  );
}
