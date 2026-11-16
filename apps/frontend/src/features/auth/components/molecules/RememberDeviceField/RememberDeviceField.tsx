import { AUTH_COPY } from '@features/auth/config/auth.copy';

/** «Recordar dispositivo» no tiene backend: casilla deshabilitada y declarada como no disponible. */
export function RememberDeviceField(): JSX.Element {
  return (
    <label className="flex items-center gap-sm cursor-not-allowed select-none mt-2xs" title={AUTH_COPY.unavailable}>
      <input type="checkbox" disabled className="w-4 h-4 cursor-not-allowed accent-carbon-blue-60" />
      <span className="text-body text-carbon-gray-70">{AUTH_COPY.rememberDevice}</span>
    </label>
  );
}
