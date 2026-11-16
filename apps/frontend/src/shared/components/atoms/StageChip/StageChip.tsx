import { STAGE_CHIP_STYLES, type ProcessStage } from '@/config/design-tokens';
import { STATUS_PILL_BASE } from '../StatusBadge/statusBadge.constants';

export type { ProcessStage };

export interface StageChipProps {
  readonly stage:     ProcessStage;
  readonly className?: string;
}

export function StageChip({ stage, className = '' }: StageChipProps): JSX.Element {
  const { classes, label } = STAGE_CHIP_STYLES[stage];

  return (
    <span aria-label={`Etapa: ${label}`} className={[STATUS_PILL_BASE, classes, className].join(' ')}>
      {label}
    </span>
  );
}
