import type { ButtonHTMLAttributes, JSX } from 'react';
import { ButtonAffix } from './ButtonAffix';
import { BUTTON_BASE_CLASSES, SIZE_CLASSES, VARIANT_CLASSES, type ButtonSize, type ButtonVariant } from './button.constants';

export type { ButtonVariant, ButtonSize };

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?:    ButtonSize;
  readonly loading?: boolean;
  readonly icon?:    string;
}

export function Button({
  variant = 'primary',
  size    = 'md',
  loading = false,
  icon,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps): JSX.Element {
  const buttonClassName = [
    ...BUTTON_BASE_CLASSES,
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    className,
  ].join(' ');

  return (
    <button
      {...rest}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClassName}
    >
      <ButtonAffix loading={loading} icon={icon} />
      {children}
    </button>
  );
}
