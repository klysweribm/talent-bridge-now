import { useState } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { Icon } from '@shared/components/atoms/Icon';
import type { TLoginFormValues } from '@features/auth/hooks/useLoginForm';

export interface PasswordFieldProps {
  readonly register: UseFormRegister<TLoginFormValues>;
  readonly error?: string;
}

export function PasswordField({ register, error }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-2xs">
      <div className="flex items-center justify-between">
        <label htmlFor="corporate-password" className="text-body-md-medium text-text-primary">
          Contraseña
        </label>
        <a href="#" className="text-label-md text-primary underline underline-offset-2">
          ¿Olvidaste tu contraseña?
        </a>
      </div>
      <div className="relative flex items-center">
        <span className="absolute pointer-events-none select-none flex items-center left-sm text-outline">
          <Icon name="lock" size={20} />
        </span>
        <input
          {...register('password')}
          id="corporate-password"
          type={visible ? 'text' : 'password'}
          placeholder="••••••••••••"
          autoComplete="current-password"
          aria-invalid={hasError || undefined}
          className={[
            'w-full h-10 pl-8 pr-8 rounded text-body-md text-text-primary bg-surface-card outline-none',
            hasError ? 'border-2 border-status-danger' : 'border border-[#8d8d8d]',
            'focus:outline-2 focus:outline-primary-interactive focus:border-transparent',
          ].join(' ')}
        />
        <button
          type="button"
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onClick={() => setVisible(v => !v)}
          className="absolute flex items-center justify-center right-xs p-2xs text-outline bg-transparent border-none cursor-pointer"
        >
          <Icon name={visible ? 'visibility_off' : 'visibility'} size={20} />
        </button>
      </div>
      {hasError && (
        <span role="alert" className="text-label-md text-status-danger">{error}</span>
      )}
    </div>
  );
}
