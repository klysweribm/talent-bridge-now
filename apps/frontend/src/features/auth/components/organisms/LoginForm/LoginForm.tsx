import { Icon } from '@shared/components/atoms/Icon';
import { Button } from '@shared/components/atoms/Button';
import { BrandHeader } from '@features/auth/components/molecules/BrandHeader';
import { ProfileDetectionBanner } from '@features/auth/components/molecules/ProfileDetectionBanner';
import { EmailField } from '@features/auth/components/molecules/EmailField';
import { PasswordField } from '@features/auth/components/molecules/PasswordField';
import { RememberDeviceField } from '@features/auth/components/molecules/RememberDeviceField/RememberDeviceField';
import { TrustFooter } from '@features/auth/components/molecules/TrustFooter/TrustFooter';
import { useLoginForm } from '@features/auth/hooks/useLoginForm';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

export function LoginForm(): JSX.Element {
  const { register, errors, handleSubmit, loading, error } = useLoginForm();

  return (
    <div className="w-full max-w-[480px] flex flex-col">
      <BrandHeader />

      <div className="mt-lg mb-lg">
        <ProfileDetectionBanner />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-md" noValidate>
        <EmailField register={register} error={errors.email?.message} />
        <PasswordField register={register} error={errors.password?.message} />
        <RememberDeviceField />

        {error && (
          <div role="alert" className="flex items-center gap-xs bg-status-danger-bg text-status-danger text-body-md rounded px-sm py-2xs">
            <Icon name="error" size={16} />
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} className="mt-2xs w-full">
          {loading ? AUTH_COPY.submitting : AUTH_COPY.submit}
          {!loading && <span aria-hidden="true" className="flex"><Icon name="arrow_forward" size={16} /></span>}
        </Button>
      </form>

      <TrustFooter />
    </div>
  );
}
