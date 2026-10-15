import { STAGE_CHIP_STYLES, type ProcessStage } from '@/config/design-tokens';

export type { ProcessStage };

export interface StageChipProps {
  readonly stage:     ProcessStage;
  readonly className?: string;
}

export function StageChip({ stage, className = '' }: StageChipProps): JSX.Element {
  const { bg, text, label } = STAGE_CHIP_STYLES[stage];

  return (
    <span
      aria-label={`Etapa: ${label}`}
      style={{ backgroundColor: bg, color: text }}
      className={[
        'inline-flex items-center h-6 px-sm rounded text-label-md font-medium',
        'whitespace-nowrap select-none',
        className,
      ].join(' ')}
    >
      {label}
    </span>
  );
}
