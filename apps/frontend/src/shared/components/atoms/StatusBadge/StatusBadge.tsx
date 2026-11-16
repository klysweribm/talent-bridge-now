import { STATUS_PILL_BASE, STATUS_VARIANT_CLASSES, type StatusVariant } from './statusBadge.constants';

export type { StatusVariant };

export interface StatusBadgeProps {
  readonly variant:    StatusVariant;
  readonly label:      string;
  readonly dot?:       boolean;
  readonly className?: string;
}

export function StatusBadge({
  variant,
  label,
  dot     = false,
  className = '',
}: StatusBadgeProps): JSX.Element {
  const { pill, dot: dotClass } = STATUS_VARIANT_CLASSES[variant];

  return (
    <span aria-label={label} className={[STATUS_PILL_BASE, pill, className].join(' ')}>
      {dot && (
        <span aria-hidden="true" className={`w-[6px] h-[6px] rounded-full flex-shrink-0 ${dotClass}`} />
      )}
      {label}
    </span>
  );
}
