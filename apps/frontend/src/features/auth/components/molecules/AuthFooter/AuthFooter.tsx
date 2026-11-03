import { BRAND } from '@/config/brand';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

export function AuthFooter(): JSX.Element {
  return (
    <footer className="flex flex-col items-center gap-sm text-center select-none max-w-[480px] w-full mt-lg">
      <div className="flex items-center gap-sm text-text-secondary">
        <span className="text-label-sm">{`${BRAND.companyName} ${BRAND.productName} ${BRAND.version}`}</span>
        <span className="text-outline-variant">•</span>
        <span className="text-label-sm font-medium text-text-primary">{BRAND.unitName}</span>
      </div>
      <ul className="flex flex-wrap items-center justify-center gap-md list-none m-0 p-0">
        {AUTH_COPY.footerEntries.map(entry => (
          <li key={entry} className="text-label-sm text-text-secondary" title={AUTH_COPY.unavailable}>
            {entry}
          </li>
        ))}
      </ul>
    </footer>
  );
}
