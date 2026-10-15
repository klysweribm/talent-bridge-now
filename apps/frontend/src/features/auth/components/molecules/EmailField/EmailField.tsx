import type { UseFormRegister } from 'react-hook-form';
import { Icon } from '@shared/components/atoms/Icon';
import type { TLoginFormValues } from '@features/auth/hooks/useLoginForm';

export interface EmailFieldProps {
  readonly register: UseFormRegister<TLoginFormValues>;
  readonly error?: string;
}

function buildClassName(hasError: boolean): string {
  return [
    'w-full h-10 pl-8 pr-[80px] rounded text-body-md text-text-primary bg-surface-card outline-none',
    hasError ? 'border-2 border-status-danger' : 'border border-[#8d8d8d]',
    'focus:outline-2 focus:outline-primary-interactive focus:border-transparent',
  ].join(' ');
}

function EmailFieldLabel(): JSX.Element {
  return (
    <label htmlFor="corporate-email" className="flex items-center justify-between text-body-md-medium text-text-primary">
      <span>Correo corporativo IBM</span>
      <span className="text-label-sm text-text-secondary">w3id ID</span>
    </label>
  );
}

export function EmailField({ register, error }: EmailFieldProps): JSX.Element {
  const hasError = Boolean(error);

  return (
    <div className="flex flex-col gap-2xs">
      <EmailFieldLabel />
      <div className="relative flex items-center">
        <span className="absolute pointer-events-none select-none flex items-center left-sm text-outline">
          <Icon name="mail" size={20} />
        </span>
        <input
          {...register('email')}
          id="corporate-email"
          type="email"
          placeholder="nombre.apellido@ibm.com"
          autoComplete="email"
          aria-invalid={hasError || undefined}
          className={buildClassName(hasError)}
        />
        <span className="absolute select-none pointer-events-none right-sm text-label-md text-text-secondary">
          @ibm.com
        </span>
      </div>
      {hasError && (
        <span role="alert" className="text-label-md text-status-danger">{error}</span>
      )}
    </div>
  );
}
