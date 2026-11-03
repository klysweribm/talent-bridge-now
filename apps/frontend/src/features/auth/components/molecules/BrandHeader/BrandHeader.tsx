import { Icon } from '@shared/components/atoms/Icon';
import { BRAND } from '@features/auth/config/brand';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

export function BrandHeader(): JSX.Element {
  return (
    <header className="flex flex-col gap-xs">
      <div className="flex items-center justify-between gap-sm">
        <div className="flex items-center gap-sm">
          <span className="font-semibold select-none text-headline-sm bg-primary-container text-primary-on rounded px-sm">
            {BRAND.companyName}
          </span>
          <span className="font-semibold text-headline-sm text-primary tracking-tight">
            {BRAND.productName}
          </span>
        </div>

        <span className="flex items-center gap-2xs select-none text-label-md bg-secondary-fixed text-secondary-on-fixed rounded px-sm py-2xs">
          <Icon name="verified_user" size={14} />
          {AUTH_COPY.ssoBadge}
        </span>
      </div>

      <p className="text-body-md text-text-secondary m-0">
        {AUTH_COPY.tagline} —{' '}
        <strong className="text-text-primary font-medium">{BRAND.unitName}</strong>
      </p>
    </header>
  );
}
