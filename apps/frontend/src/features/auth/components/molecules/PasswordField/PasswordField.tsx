import { useState } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { Icon } from '@shared/components/atoms/Icon';
import type { TLoginFormValues } from '@features/auth/hooks/useLoginForm';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

export interface PasswordFieldProps {
  readonly register: UseFormRegister<TLoginFormValues>;
  readonly error?: string;
}

function buildClassName(hasError: boolean): string {
  return [
    'w-full h-10 pl-8 pr-8 text-body text-carbon-gray-100 bg-carbon-gray-10 rounded-none border-0 border-b border-carbon-gray-50 outline-none',
    hasError ? 'ring-2 ring-inset ring-carbon-red' : '',
    'focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-carbon-blue-60',
  ].join(' ');
}

function PasswordFieldLabel(): JSX.Element {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor="corporate-password" className="text-label text-carbon-gray-70">
        {AUTH_COPY.passwordLabel}
      </label>
      <button
        type="button"
        disabled
        title={AUTH_COPY.unavailable}
        className="text-label text-carbon-gray-70 bg-transparent border-none p-0 cursor-not-allowed"
      >
        {AUTH_COPY.forgotPassword}
      </button>
    </div>
  );
}

interface IVisibilityToggleProps {
  readonly visible:   boolean;
  readonly onToggle:  () => void;
}

function VisibilityToggle({ visible, onToggle }: IVisibilityToggleProps): JSX.Element {
  return (
    <button
      type="button"
      aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      onClick={onToggle}
      className="absolute flex items-center justify-center right-xs p-2xs text-carbon-gray-50 bg-transparent border-none cursor-pointer"
    >
      <Icon name={visible ? 'visibility_off' : 'visibility'} size={20} />
    </button>
  );
}

export function PasswordField({ register, error }: PasswordFieldProps): JSX.Element {
  const [visible, setVisible] = useState(false);
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-2xs">
      <PasswordFieldLabel />
      <div className="relative flex items-center">
        <span className="absolute pointer-events-none select-none flex items-center left-sm text-carbon-gray-50">
          <Icon name="lock" size={20} />
        </span>
        <input
          {...register('password')}
          id="corporate-password"
          type={visible ? 'text' : 'password'}
          placeholder="••••••••••••"
          autoComplete="current-password"
          aria-invalid={hasError || undefined}
          className={buildClassName(hasError)}
        />
        <VisibilityToggle visible={visible} onToggle={() => setVisible(v => !v)} />
      </div>
      {hasError && (
        <span role="alert" className="text-label text-carbon-red">{error}</span>
      )}
    </div>
  );
}
