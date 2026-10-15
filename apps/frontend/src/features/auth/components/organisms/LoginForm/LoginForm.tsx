import { useState } from 'react';
import { Icon } from '@shared/components/atoms/Icon';
import { Button } from '@shared/components/atoms/Button';
import { BrandHeader } from '@features/auth/components/molecules/BrandHeader';
import { ProfileDetectionBanner } from '@features/auth/components/molecules/ProfileDetectionBanner';
import { EmailField } from '@features/auth/components/molecules/EmailField';
import { PasswordField } from '@features/auth/components/molecules/PasswordField';
import { SsoLoginButton } from '@features/auth/components/molecules/SsoLoginButton';
import { useLoginForm } from '@features/auth/hooks/useLoginForm';

interface IRememberMeProps {
  readonly checked:  boolean;
  readonly onChange: (checked: boolean) => void;
}

function RememberMe({ checked, onChange }: IRememberMeProps): JSX.Element {
  return (
    <label className="flex items-center gap-sm cursor-pointer select-none mt-2xs">
      <input
        type="checkbox"
        checked={checked}
        onChange={e => onChange(e.target.checked)}
        className="w-4 h-4 accent-primary-interactive cursor-pointer"
      />
      <span className="text-body-md text-text-secondary">
        Recordar este dispositivo por 30 días
      </span>
    </label>
  );
}

function TrustFooter(): JSX.Element {
  return (
    <>
      <div className="relative flex items-center justify-center my-lg">
        <div className="absolute w-full h-px bg-surface-highest" />
        <span className="relative uppercase bg-surface-card px-sm text-label-sm tracking-wide text-text-secondary">
          o ingresar con credenciales corporativas
        </span>
      </div>

      <SsoLoginButton />

      <div className="flex items-center justify-center gap-sm mt-lg pt-md">
        <Icon name="verified_user" size={16} className="text-status-success" />
        <span className="text-label-sm text-text-secondary">
          Conexión cifrada TLS 1.3 autenticada por IBM Trust Gateway
        </span>
      </div>
    </>
  );
}

export function LoginForm(): JSX.Element {
  const [remember, setRemember] = useState(false);
  const { register, errors, handleSubmit, loading, error } = useLoginForm();

  return (
    <div className="w-full max-w-[480px] rounded-xl flex flex-col bg-surface-card shadow-modal p-lg">
      <BrandHeader />

      <div className="mt-lg mb-lg">
        <ProfileDetectionBanner />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-md" noValidate>
        <EmailField register={register} error={errors.email?.message} />
        <PasswordField register={register} error={errors.password?.message} />
        <RememberMe checked={remember} onChange={setRemember} />

        {error && (
          <div role="alert" className="flex items-center gap-xs bg-status-danger-bg text-status-danger text-body-md rounded px-sm py-2xs">
            <Icon name="error" size={16} />
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="mt-2xs w-full">
          {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
        </Button>
      </form>

      <TrustFooter />
    </div>
  );
}
