import { Icon } from '@shared/components/atoms/Icon';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

export function ProfileDetectionBanner(): JSX.Element {
  return (
    <section className="flex items-start gap-sm bg-carbon-gray-10 border border-carbon-gray-20 p-md">
      <Icon name="psychology" size={20} className="flex-shrink-0 text-carbon-blue-60 mt-2xs" />
      <div className="flex flex-col">
        <span className="text-label font-semibold text-carbon-gray-100">{AUTH_COPY.detectionTitle}</span>
        <p className="text-label text-carbon-gray-70 mt-2xs mb-0">{AUTH_COPY.detectionBody}</p>
      </div>
    </section>
  );
}
