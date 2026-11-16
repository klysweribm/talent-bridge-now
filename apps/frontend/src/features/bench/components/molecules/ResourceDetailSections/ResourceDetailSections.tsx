import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import { formatAvailability, formatBenchDate } from '../../../utils/formatAvailability';
import { BenchStatusBadge } from '../../atoms/BenchStatusBadge';
import { SeniorityBadge } from '../../atoms/SeniorityBadge';
import { ResourceLanguagesSection } from '../ResourceLanguagesSection';
import { ResourceSkillsSection } from '../ResourceSkillsSection';

export interface ResourceDetailSectionsProps {
  readonly resource: IBenchResource;
}

const H3 = 'text-h2 text-carbon-gray-100 mb-sm';

export function ResourceDetailSections({ resource }: ResourceDetailSectionsProps): JSX.Element {
  return (
    <div className="flex flex-col gap-lg">
      <div className="flex items-center gap-sm">
        <SeniorityBadge seniority={resource.seniority} />
        <BenchStatusBadge status={resource.status} />
        <span className="text-body text-carbon-gray-70">{resource.primaryRole} · {resource.practice}</span>
      </div>
      <ResourceSkillsSection skills={resource.skills} />
      <ResourceLanguagesSection languages={resource.languages} />
      <section aria-label="Ubicación y disponibilidad">
        <h3 className={H3}>Ubicación y disponibilidad</h3>
        <dl className="grid grid-cols-2 gap-x-base gap-y-sm text-body">
          <dt className="text-carbon-gray-70">Ubicación</dt>
          <dd className="text-carbon-gray-100">{resource.location.city}, {resource.location.country}</dd>
          <dt className="text-carbon-gray-70">En banca desde</dt>
          <dd className="text-carbon-gray-100">{formatBenchDate(resource.benchSince)}</dd>
          <dt className="text-carbon-gray-70">Disponible desde</dt>
          <dd className="text-carbon-gray-100">{formatAvailability(resource.availableFrom)}</dd>
        </dl>
      </section>
    </div>
  );
}
