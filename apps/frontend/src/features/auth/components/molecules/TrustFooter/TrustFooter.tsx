import { Icon } from '@shared/components/atoms/Icon';
import { SsoLoginButton } from '@features/auth/components/molecules/SsoLoginButton/SsoLoginButton';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

export function TrustFooter(): JSX.Element {
  return (
    <>
      <div className="relative flex items-center justify-center my-lg">
        <div className="absolute w-full h-px bg-carbon-gray-20" />
        <span className="relative uppercase bg-white px-sm text-label tracking-wide text-carbon-gray-70">
          {AUTH_COPY.divider}
        </span>
      </div>

      <SsoLoginButton />

      <div className="flex items-center justify-center gap-sm mt-lg pt-md">
        <Icon name="verified_user" size={16} className="text-carbon-green" />
        <span className="text-label text-carbon-gray-70">{AUTH_COPY.tlsNote}</span>
      </div>
    </>
  );
}
