import type { JSX } from 'react';
import { Icon } from '@shared/components/atoms/Icon';

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
    <div className="flex flex-col items-center justify-center gap-base h-full px-xl py-2xl text-center">
      <span className="w-16 h-16 rounded-full bg-surface-high flex items-center justify-center text-primary-interactive">
        <Icon name="construction" size={32} />
      </span>
      <h1 className="text-headline-md text-text-primary">{label}</h1>
      <p className="text-body-md text-text-secondary max-w-[480px]">
        Esta sección está en construcción. El equipo de IBM Talent Bridge está
        trabajando en ella — vuelve pronto.
      </p>
    </div>
  );
}
