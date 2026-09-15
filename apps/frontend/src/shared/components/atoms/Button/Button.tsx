import type { ButtonHTMLAttributes } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize    = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?:    ButtonSize;
  readonly loading?: boolean;
  readonly icon?:    string;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-interactive text-white hover:bg-primary-container active:bg-[#002d9c]',
  secondary:
    'bg-transparent border border-primary-interactive text-primary-interactive hover:bg-[#edf5ff]',
  ghost:
    'bg-transparent text-primary-interactive hover:bg-[#ebebeb]',
  danger:
    'bg-status-danger text-white hover:bg-[#ba1b23]',
} as const;

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'h-8 px-base text-body-md',
  md: 'h-10 px-base text-body-md-medium',
} as const;

export function Button({
  variant = 'primary',
  size    = 'md',
  loading = false,
  icon,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center gap-xs rounded font-medium',
        'transition-colors duration-150 focus-visible:outline-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(' ')}
    >
      {loading ? (
        <span
          aria-hidden="true"
          className="material-symbols-outlined animate-spin text-[16px]"
        >
          progress_activity
        </span>
      ) : icon ? (
        <span aria-hidden="true" className="material-symbols-outlined text-[18px]">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
