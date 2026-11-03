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
    <section aria-labelledby="technical-team-heading" className="flex flex-col gap-base p-lg rounded-lg border border-surface-high bg-surface-card">
      <header className="flex items-start justify-between gap-md">
        <div className="flex items-start gap-md">
          <span className="flex items-center justify-center size-10 rounded bg-primary-fixed text-primary-interactive flex-shrink-0">
            <Icon name="group" size={20} />
          </span>
          <div className="flex flex-col">
            <h2 id="technical-team-heading" className="text-title-md text-text-primary">{COPY.title}</h2>
            <p className="text-body-md text-text-secondary">{COPY.subtitle}</p>
          </div>
        </div>
        <span className={`inline-flex items-center h-6 px-sm rounded text-label-md whitespace-nowrap ${complete ? 'bg-status-success-bg text-status-success-text' : 'bg-surface-high text-text-secondary'}`}>
          {statusLabel(refs.length, maxRefs)}
        </span>
      </header>
      {refs.length === 0
        ? <p className="text-body-md text-text-secondary">{COPY.empty}</p>
        : (
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {refs.map(technicalRef => <li key={technicalRef.id}><TechnicalRefCard technicalRef={technicalRef} /></li>)}
          </ul>
        )}
      {actions}
    </section>
  );
}
