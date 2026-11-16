import type { ReactNode } from 'react';
import type { IProcessTechnicalRef } from '@ibm-talent-bridge/shared-types';
import { Icon } from '@shared/components/atoms/Icon/Icon';
import { TECHNICAL_TEAM_COPY as COPY } from '../../../config/technicalTeam.copy';
import { TechnicalRefCard } from '../TechnicalRefCard/TechnicalRefCard';

export interface TechnicalTeamCardProps {
  readonly refs:     readonly IProcessTechnicalRef[];
  /** Sin tope conocido (p. ej. technical_ref no ve los límites) solo se muestra la cantidad asignada. */
  readonly maxRefs?: number | undefined;
  /** Slot opcional (p. ej. el botón «Gestionar»); el componente no sabe de permisos ni de datos remotos. */
  readonly actions?: ReactNode;
}

function statusLabel(count: number, max: number | undefined): string {
  if (count === 0) return COPY.none;
  if (max === undefined) return COPY.assigned(count);
  return count >= max ? COPY.complete : COPY.partial(count, max);
}

/** Tarjeta presentacional «Equipo técnico asignado»: solo props, reutilizable en otras vistas. */
export function TechnicalTeamCard({ refs, maxRefs, actions }: TechnicalTeamCardProps): JSX.Element {
  const complete = maxRefs !== undefined && refs.length >= maxRefs;
  return (
    <section aria-labelledby="technical-team-heading" className="flex flex-col gap-base p-lg border border-carbon-gray-20 bg-white">
      <header className="flex items-start justify-between gap-md">
        <div className="flex items-start gap-md">
          <span className="flex items-center justify-center size-10 bg-carbon-blue-20 text-carbon-blue-60 flex-shrink-0">
            <Icon name="group" size={20} />
          </span>
          <div className="flex flex-col">
            <h2 id="technical-team-heading" className="text-h2 text-carbon-gray-100">{COPY.title}</h2>
            <p className="text-body text-carbon-gray-70">{COPY.subtitle}</p>
          </div>
        </div>
        <span className={`inline-flex items-center h-6 px-sm rounded-pill text-label whitespace-nowrap ${complete ? 'bg-carbon-green-tag-bg text-carbon-green-tag-text' : 'bg-carbon-gray-20 text-carbon-gray-70'}`}>
          {statusLabel(refs.length, maxRefs)}
        </span>
      </header>
      {refs.length === 0
        ? <p className="text-body text-carbon-gray-70">{COPY.empty}</p>
        : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {refs.map(technicalRef => <li key={technicalRef.id}><TechnicalRefCard technicalRef={technicalRef} /></li>)}
          </ul>
        )}
      {actions}
    </section>
  );
}
