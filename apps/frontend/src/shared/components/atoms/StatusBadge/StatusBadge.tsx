export type StatusVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusBadgeProps {
  readonly variant:    StatusVariant;
  readonly label:      string;
  readonly dot?:       boolean;
  readonly className?: string;
}

const VARIANT_STYLES: Record<StatusVariant, { bg: string; text: string }> = {
  success: { bg: '#defbe6', text: '#24a148' },
  warning: { bg: '#fef3d6', text: '#8a6100' },
  danger:  { bg: '#ffebeb', text: '#da1e28' },
  info:    { bg: '#edf5ff', text: '#0043ce' },
  neutral: { bg: '#e8e8e8', text: '#525252' },
} as const;

export function StatusBadge({
  variant,
  label,
  dot     = false,
  className = '',
}: StatusBadgeProps): JSX.Element {
  const { bg, text } = VARIANT_STYLES[variant];

  return (
    <span
      aria-label={label}
      style={{ backgroundColor: bg, color: text }}
      className={[
        'inline-flex items-center gap-2xs h-6 px-sm rounded',
        'text-label-md font-medium whitespace-nowrap select-none',
        className,
      ].join(' ')}
    >
      {dot && (
        <span
          aria-hidden="true"
          style={{ backgroundColor: text }}
          className="w-[6px] h-[6px] rounded-full flex-shrink-0"
        />
      )}
      {label}
    </span>
  );
}
