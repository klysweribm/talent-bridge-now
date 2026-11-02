import type { IDraftEducation } from '@ibm-talent-bridge/shared-types';
import { EXTRA_SECTION_LABELS } from '../../../config/candidates.constants';
import { ExtraItem } from '../../atoms/ExtraItem';
import { ExtraSection } from '../../atoms/ExtraSection';

export interface EducationListProps {
  readonly items: readonly IDraftEducation[];
}

export function EducationList({ items }: EducationListProps): JSX.Element {
  return (
    <ExtraSection title={EXTRA_SECTION_LABELS.education}>
      {items.map((item, index) => (
        <ExtraItem key={index} title={item.institution} subtitle={item.degree} meta={item.year?.toString()} />
      ))}
    </ExtraSection>
  );
}
