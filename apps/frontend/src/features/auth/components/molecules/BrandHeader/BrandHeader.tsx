import { Icon } from '@shared/components/atoms/Icon';
import { BRAND } from '@/config/brand';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

export function BrandHeader(): JSX.Element {
  return (
    <header className="flex flex-col gap-xs">
      <div className="flex items-center justify-between gap-sm">
        <div className="flex items-center gap-sm">
          <span className="font-semibold select-none text-h3 text-carbon-gray-100">
            {BRAND.companyName}
          </span>
          <span className="font-normal text-h3 text-carbon-gray-100">
            {BRAND.productName}
          </span>
        </div>

        <span className="flex items-center gap-2xs select-none text-label bg-carbon-blue-10 text-carbon-blue-70 rounded-pill px-sm py-2xs">
          <Icon name="verified_user" size={14} />
          {AUTH_COPY.ssoBadge}
        </span>
      </div>

      <p className="text-body text-carbon-gray-70 m-0">
        {AUTH_COPY.tagline} —{' '}
        <strong className="text-carbon-gray-100 font-semibold">{BRAND.unitName}</strong>
      </p>
    </header>
  );
}
