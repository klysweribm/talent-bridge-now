import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { Icon } from '@shared/components/atoms/Icon/Icon';
import { StatusChip } from '@shared/components/atoms/StatusChip/StatusChip';
import { PROCESS_DETAIL_CARD_COPY as COPY } from '../../../config/processDetailCard.copy';
import { PROCESS_LIST_COPY, formatCandidateCount } from '../../../config/processList.constants';
import { SkillChip } from '@shared/components/atoms/SkillChip/SkillChip';
import { formatStartDate } from '../../../utils/formatStartDate';

export interface ProcessDetailCardProps {
  readonly process: IProcessDetail;
}

const Fact = ({ label, value }: { readonly label: string; readonly value: string }): JSX.Element => (
  <div className="flex flex-col gap-2xs p-base border-r border-b border-carbon-gray-20 -mr-px -mb-px">
    <dt className="text-label text-carbon-gray-70">{label}</dt>
    <dd className="text-body text-carbon-gray-100">{value}</dd>
  </div>
);

function Header({ process }: ProcessDetailCardProps): JSX.Element {
  return (
    <header className="flex items-start justify-between gap-md">
      <div className="flex flex-col gap-xs">
        <p className="flex items-center gap-xs text-label uppercase text-carbon-gray-70">
          <Icon name="apartment" size={16} />{COPY.organization}
        </p>
        <h1 className="text-h1 text-carbon-gray-100">{process.title}</h1>
        {process.opportunityRole && <p className="text-h3 text-carbon-gray-70">{process.opportunityRole}</p>}
        <p className="text-body text-carbon-gray-70">
          {formatCandidateCount(process.candidates.length, process.maxCandidates)} {PROCESS_LIST_COPY.candidatesHeading.toLowerCase()}
        </p>
      </div>
      <StatusChip status={process.status} />
    </header>
  );
}

function Sections({ process: { skills, roleDescription } }: ProcessDetailCardProps): JSX.Element {
  return (
    <>
      {skills.length > 0 && (
        <section aria-labelledby="detail-stack" className="flex flex-col gap-base bg-white border border-carbon-gray-20 p-lg">
          <h2 id="detail-stack" className="text-h2 text-carbon-gray-100">{COPY.stack}</h2>
          <ul className="flex flex-wrap gap-xs">{skills.map(skill => <li key={skill}><SkillChip label={skill} /></li>)}</ul>
        </section>
      )}
      {roleDescription && (
        <section aria-labelledby="detail-expectations" className="flex flex-col gap-base bg-white border border-carbon-gray-20 p-lg">
          <h2 id="detail-expectations" className="flex items-center gap-xs text-h2 text-carbon-gray-100">
            <Icon name="description" size={18} />{COPY.expectations}
          </h2>
          <p className="text-body text-carbon-gray-70 whitespace-pre-line break-words">{roleDescription}</p>
        </section>
      )}
    </>
  );
}

/** Tarjeta «Detalle del proceso». Los datos de la oportunidad que un proceso legacy no tiene se omiten, sin vacíos ni «null». */
export function ProcessDetailCard({ process }: ProcessDetailCardProps): JSX.Element {
  return (
    <article className="flex flex-col gap-lg">
      <Header process={process} />
      <dl className="grid grid-cols-1 sm:grid-cols-2 bg-white border-t border-l border-carbon-gray-20 overflow-hidden">
        <Fact label={COPY.client} value={process.clientName} />
        {process.band !== null && <Fact label={COPY.band} value={COPY.bandValue(process.band)} />}
        {process.startDate !== null && <Fact label={COPY.startDate} value={formatStartDate(process.startDate)} />}
      </dl>
      <Sections process={process} />
    </article>
  );
}
