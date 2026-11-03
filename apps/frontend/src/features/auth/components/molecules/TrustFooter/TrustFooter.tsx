import { Icon } from '@shared/components/atoms/Icon';
import { SsoLoginButton } from '@features/auth/components/molecules/SsoLoginButton/SsoLoginButton';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

export function TrustFooter(): JSX.Element {
  return (
    <>
      <div className="relative flex items-center justify-center my-lg">
        <div className="absolute w-full h-px bg-surface-highest" />
        <span className="relative uppercase bg-surface-card px-sm text-label-sm tracking-wide text-text-secondary">
          {AUTH_COPY.divider}
        </span>
      </div>

      <SsoLoginButton />

      <div className="flex items-center justify-center gap-sm mt-lg pt-md">
        <Icon name="verified_user" size={16} className="text-status-success" />
        <span className="text-label-sm text-text-secondary">{AUTH_COPY.tlsNote}</span>
      </div>
    </>
  );
}
