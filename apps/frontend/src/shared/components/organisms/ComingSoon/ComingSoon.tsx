import type { JSX } from 'react';
import { Icon } from '@shared/components/atoms/Icon';
import { BRAND } from '@/config/brand';

/**
 * ComingSoon — placeholder de marca para una sección protegida que todavía
 * no tiene pantalla real (QW-1). Se renderiza SIEMPRE dentro de `AppLayout`
 * (vía `ProtectedRoute`), así ningún click del sidebar/dashboard termina en
 * una página en blanco o en un 404.
 */
export interface ComingSoonProps {
  readonly label: string;
}

export function ComingSoon({ label }: ComingSoonProps): JSX.Element {
  return (
    <div className="mx-auto flex w-full max-w-content-max flex-col items-start gap-base px-xl pb-3xl pt-lg">
      <Icon name="construction" size={32} className="text-carbon-blue-60" />
      <h1 className="text-h1 text-carbon-gray-100">{label}</h1>
      <p className="max-w-[480px] text-body text-carbon-gray-70">
        {`Esta sección está en construcción. El equipo de ${BRAND.productFullName} está trabajando en ella — vuelve pronto.`}
      </p>
    </div>
  );
}
