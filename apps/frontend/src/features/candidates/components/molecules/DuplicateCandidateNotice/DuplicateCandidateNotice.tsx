import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import { InlineNotification } from '@shared/components/molecules/InlineNotification';
import { Button } from '@shared/components/atoms/Button';
import { DUPLICATE_COPY } from '../../../config/candidates.constants';

export interface DuplicateCandidateNoticeProps {
  readonly existing: ICandidate;
  readonly onUpdateExisting: () => void;
}

export function DuplicateCandidateNotice({ existing, onUpdateExisting }: DuplicateCandidateNoticeProps): JSX.Element {
  return (
    <InlineNotification kind="error" role="alert">
      <div className="flex flex-col items-start gap-xs">
        <p className="font-semibold">{DUPLICATE_COPY.title}</p>
        <p>{existing.fullName} · {existing.email}</p>
        <p>{DUPLICATE_COPY.emailNote}</p>
        <Button type="button" variant="secondary" size="sm" onClick={onUpdateExisting}>{DUPLICATE_COPY.updateExisting}</Button>
      </div>
    </InlineNotification>
  );
}
