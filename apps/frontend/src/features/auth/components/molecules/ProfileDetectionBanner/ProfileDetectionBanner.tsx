import { Icon } from '@shared/components/atoms/Icon';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

export function ProfileDetectionBanner(): JSX.Element {
  return (
    <section className="flex items-start gap-sm bg-surface-low rounded-lg p-md">
      <Icon name="psychology" size={20} className="flex-shrink-0 text-primary-interactive mt-2xs" />
      <div className="flex flex-col">
        <span className="text-label-md text-text-primary">{AUTH_COPY.detectionTitle}</span>
        <p className="text-label-sm text-text-secondary mt-2xs mb-0">{AUTH_COPY.detectionBody}</p>
      </div>
    </section>
  );
}
