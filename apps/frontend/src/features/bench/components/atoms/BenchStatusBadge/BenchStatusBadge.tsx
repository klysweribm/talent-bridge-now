import type { TBenchStatus } from '@ibm-talent-bridge/shared-types';
import { StatusBadge, type StatusVariant } from '@shared/components/atoms/StatusBadge';
import { STATUS_LABELS } from '../../../config/bench.constants';

export interface BenchStatusBadgeProps {
  readonly status: TBenchStatus;
}

const VARIANTS: Readonly<Record<TBenchStatus, StatusVariant>> = {
  available:   'success',
  soft_booked: 'warning',
  assigned:    'neutral',
};

export function BenchStatusBadge({ status }: BenchStatusBadgeProps): JSX.Element {
  return <StatusBadge variant={VARIANTS[status]} label={STATUS_LABELS[status]} dot />;
}
