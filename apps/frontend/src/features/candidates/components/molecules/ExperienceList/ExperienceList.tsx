import type { IDraftExperience } from '@ibm-talent-bridge/shared-types';
import { EXTRA_SECTION_LABELS } from '../../../config/candidates.constants';
import { ExtraItem } from '../../atoms/ExtraItem';
import { ExtraSection } from '../../atoms/ExtraSection';

export interface ExperienceListProps {
  readonly items: readonly IDraftExperience[];
}

const period = ({ from, to }: IDraftExperience): string | undefined =>
  from || to ? `${from ?? '—'} – ${to ?? 'actualidad'}` : undefined;

/** Orden tal cual lo entrega el borrador. */
export function ExperienceList({ items }: ExperienceListProps): JSX.Element {
  return (
    <ExtraSection title={EXTRA_SECTION_LABELS.experience}>
      {items.map((item, index) => (
        <ExtraItem key={index} title={item.role} subtitle={item.company} meta={period(item)} body={item.summary} />
      ))}
    </ExtraSection>
  );
}
