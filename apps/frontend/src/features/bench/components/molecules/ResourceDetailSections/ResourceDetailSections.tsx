import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import { formatAvailability, formatBenchDate } from '../../../utils/formatAvailability';
import { BenchStatusBadge } from '../../atoms/BenchStatusBadge';
import { SeniorityBadge } from '../../atoms/SeniorityBadge';
import { ResourceLanguagesSection } from '../ResourceLanguagesSection';
import { ResourceSkillsSection } from '../ResourceSkillsSection';

export interface ResourceDetailSectionsProps {
  readonly resource: IBenchResource;
}

const H3 = 'text-title-md text-text-primary mb-sm';

export function ResourceDetailSections({ resource }: ResourceDetailSectionsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center gap-sm">
        <SeniorityBadge seniority={resource.seniority} />
        <BenchStatusBadge status={resource.status} />
        <span className="text-body-md text-text-secondary">{resource.primaryRole} · {resource.practice}</span>
      </div>
      <ResourceSkillsSection skills={resource.skills} />
      <ResourceLanguagesSection languages={resource.languages} />
      <section aria-label="Ubicación y disponibilidad">
        <h3 className={H3}>Ubicación y disponibilidad</h3>
        <dl className="grid grid-cols-2 gap-sm text-body-md">
          <dt className="text-text-secondary">Ubicación</dt>
          <dd className="text-text-primary">{resource.location.city}, {resource.location.country}</dd>
          <dt className="text-text-secondary">En banca desde</dt>
          <dd className="text-text-primary">{formatBenchDate(resource.benchSince)}</dd>
          <dt className="text-text-secondary">Disponible desde</dt>
          <dd className="text-text-primary">{formatAvailability(resource.availableFrom)}</dd>
        </dl>
      </section>
    </div>
  );
}
