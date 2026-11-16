import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';
import { PROCESS_STATUS_CHIP } from '@/config/processStatus';
import { STATUS_PILL_BASE } from '../StatusBadge/statusBadge.constants';

export interface StatusChipProps {
  readonly status:     TProcessStatus;
  readonly className?: string;
}

export function StatusChip({ status, className = '' }: StatusChipProps): JSX.Element {
  const { label, classes, dot } = PROCESS_STATUS_CHIP[status];
  return (
    <span className={[STATUS_PILL_BASE, classes, className].join(' ')}>
      <span aria-hidden="true" className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}
