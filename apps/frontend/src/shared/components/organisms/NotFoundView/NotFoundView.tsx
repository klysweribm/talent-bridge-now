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
      <span className="w-16 h-16 rounded-full bg-status-danger-bg flex items-center justify-center text-status-danger">
        <Icon name="error" size={32} />
      </span>
      <h1 className="text-headline-md text-text-primary">Página no encontrada</h1>
      <p className="text-body-md text-text-secondary max-w-[480px]">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link
        to={backTo}
        className="inline-flex items-center gap-xs px-base h-10 rounded-lg bg-primary-container hover:bg-primary text-white text-body-md-medium transition-colors"
      >
        {backLabel}
      </Link>
    </div>
  );
}
