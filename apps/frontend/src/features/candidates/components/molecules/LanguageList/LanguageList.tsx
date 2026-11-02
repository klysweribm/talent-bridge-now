import type { ILanguageLevel } from '@ibm-talent-bridge/shared-types';
import { EXTRA_SECTION_LABELS, LANGUAGE_LEVEL_LABELS } from '../../../config/candidates.constants';
import { formatLanguage } from '../../../utils/formatLanguage';
import { ExtraItem } from '../../atoms/ExtraItem';
import { ExtraSection } from '../../atoms/ExtraSection';

export interface LanguageListProps {
  readonly items: readonly ILanguageLevel[];
}

export function LanguageList({ items }: LanguageListProps): JSX.Element {
  return (
    <ExtraSection title={EXTRA_SECTION_LABELS.languages}>
      {items.map(item => (
        <ExtraItem key={item.code} title={formatLanguage(item.code)} meta={LANGUAGE_LEVEL_LABELS[item.level]} />
      ))}
    </ExtraSection>
  );
}
