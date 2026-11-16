import type { JSX } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@shared/components/atoms/Icon';

/**
 * NotFoundView — contenido del 404. `AppRouter` decide si lo envuelve en
 * `AppLayout` (usuario autenticado) o lo muestra "pelado" (sin sesión), pero
 * en ambos casos ofrece un link de vuelta en vez de dejar al usuario varado.
 */
export interface NotFoundViewProps {
  readonly backTo: string;
  readonly backLabel: string;
}

export function NotFoundView({ backTo, backLabel }: NotFoundViewProps): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center gap-base h-full min-h-[60vh] px-xl py-2xl text-center">
      <Icon name="error" size={32} className="text-carbon-red" />
      <h1 className="text-h1 text-carbon-gray-100">Página no encontrada</h1>
      <p className="text-body text-carbon-gray-70 max-w-[480px]">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link
        to={backTo}
        className="relative inline-flex h-10 items-center bg-carbon-blue-60 pl-base pr-2xl text-body text-white transition-colors hover:bg-carbon-blue-60-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-carbon-blue-60"
      >
        {backLabel}
      </Link>
    </div>
  );
}
