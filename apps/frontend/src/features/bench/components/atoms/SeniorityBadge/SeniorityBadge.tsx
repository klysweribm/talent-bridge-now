import type { TSeniority } from '@ibm-talent-bridge/shared-types';
import { SENIORITY_OPTIONS } from '../../../config/bench.constants';

export interface SeniorityBadgeProps {
  readonly seniority: TSeniority;
}

export function SeniorityBadge({ seniority }: SeniorityBadgeProps): JSX.Element {
  const label = SENIORITY_OPTIONS.find(option => option.value === seniority)?.label ?? seniority;

  return (
    <span className="inline-flex items-center h-6 px-sm rounded bg-surface-high text-label-md font-medium text-text-primary">
      {label}
    </span>
  );
}
