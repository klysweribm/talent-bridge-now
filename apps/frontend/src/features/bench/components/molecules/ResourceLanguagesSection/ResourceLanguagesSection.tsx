import type { ILanguageLevel } from '@ibm-talent-bridge/shared-types';
import { LANGUAGE_LEVEL_LABELS } from '../../../config/bench.constants';

export interface ResourceLanguagesSectionProps {
  readonly languages: readonly ILanguageLevel[];
}

export function ResourceLanguagesSection({ languages }: ResourceLanguagesSectionProps): JSX.Element {
  return (
    <section aria-label="Idiomas">
      <h3 className="text-title-md text-text-primary mb-sm">Idiomas</h3>
      <ul className="flex flex-col gap-xs text-body-md text-text-primary">
        {languages.map(({ code, level }) => (
          <li key={code}>{code.toUpperCase()} · {LANGUAGE_LEVEL_LABELS[level]}</li>
        ))}
      </ul>
    </section>
  );
}
