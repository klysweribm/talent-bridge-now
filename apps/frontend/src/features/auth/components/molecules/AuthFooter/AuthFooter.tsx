import { BRAND } from '@/config/brand';
import { AUTH_COPY } from '@features/auth/config/auth.copy';

export function AuthFooter(): JSX.Element {
  return (
    <footer className="flex flex-col items-center gap-sm text-center select-none max-w-[480px] w-full mt-lg">
      <div className="flex items-center gap-sm text-carbon-gray-70">
        <span className="text-label">{`${BRAND.companyName} ${BRAND.productName} ${BRAND.version}`}</span>
        <span className="text-carbon-gray-30">•</span>
        <span className="text-label text-carbon-gray-100">{BRAND.unitName}</span>
      </div>
      <ul className="flex flex-wrap items-center justify-center gap-md list-none m-0 p-0">
        {AUTH_COPY.footerEntries.map(entry => (
          <li key={entry} className="text-label text-carbon-gray-70" title={AUTH_COPY.unavailable}>
            {entry}
          </li>
        ))}
      </ul>
    </footer>
  );
}
