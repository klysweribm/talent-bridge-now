import { Icon } from '@shared/components/atoms/Icon';
import { IbmLogoMark } from '@features/auth/components/atoms/IbmLogoMark';

export function SsoLoginButton(): JSX.Element {
  return (
    <button
      type="button"
      aria-label="Acceder con IBM w3id SSO"
      className="flex items-center justify-center gap-sm w-full h-10 rounded text-body-md-medium bg-surface-low text-text-primary border-none cursor-pointer transition-colors duration-150 hover:bg-surface-base"
    >
      <IbmLogoMark />
      <span>Acceder con IBM w3id SSO</span>
      <Icon name="lock_open" size={16} className="ml-auto text-text-secondary" />
    </button>
  );
}
