import type { TProcessStatus } from '@ibm-talent-bridge/shared-types';
import { PROCESS_STATUS_CHIP } from '@/config/processStatus';

export interface StatusChipProps {
  readonly status:     TProcessStatus;
  readonly className?: string;
}

export function StatusChip({ status, className = '' }: StatusChipProps): JSX.Element {
  const { label, classes } = PROCESS_STATUS_CHIP[status];
  return (
    <span className={['inline-flex items-center h-6 px-sm rounded text-label-md font-medium whitespace-nowrap select-none', classes, className].join(' ')}>
      {label}
    </span>
  );
}
