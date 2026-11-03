import { Icon } from '@shared/components/atoms/Icon';
import { IbmLogoMark } from '@features/auth/components/atoms/IbmLogoMark';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

/** SSO no tiene backend todavía: el botón queda deshabilitado y declarado como no disponible. */
export function SsoLoginButton(): JSX.Element {
  return (
    <button
      type="button"
      disabled
      title={AUTH_COPY.unavailable}
      aria-label={AUTH_COPY.sso}
      className="flex items-center justify-center gap-sm w-full h-10 rounded text-body-md-medium bg-surface-low text-text-primary border-none cursor-not-allowed opacity-60"
    >
      <IbmLogoMark />
      <span>{AUTH_COPY.sso}</span>
      <Icon name="lock_open" size={16} className="ml-auto text-text-secondary" />
    </button>
  );
}
