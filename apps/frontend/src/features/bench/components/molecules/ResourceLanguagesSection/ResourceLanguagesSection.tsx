import type { ILanguageLevel } from '@ibm-talent-bridge/shared-types';
import { LANGUAGE_LEVEL_LABELS, LANGUAGE_LEVEL_ORDER } from '../../../config/bench.constants';
import { LevelSegments } from '../../atoms/LevelSegments';

export interface ResourceLanguagesSectionProps {
  readonly languages: readonly ILanguageLevel[];
}

export function ResourceLanguagesSection({ languages }: ResourceLanguagesSectionProps): JSX.Element {
  return (
    <section aria-label="Idiomas">
      <h3 className="text-h2 text-carbon-gray-100 mb-sm">Idiomas</h3>
      <ul className="flex flex-col">
        {languages.map(({ code, level }) => {
          const rank = LANGUAGE_LEVEL_ORDER.indexOf(level) + 1;
          return (
            <li key={code} className="flex items-center justify-between gap-base border-b border-carbon-gray-20 py-sm">
              <span className="text-body text-carbon-gray-100">{code.toUpperCase()} · {LANGUAGE_LEVEL_LABELS[level]}</span>
              <span className="flex items-center gap-sm">
                <LevelSegments filled={rank} total={LANGUAGE_LEVEL_ORDER.length} />
                <span aria-hidden="true" className="font-mono text-[12px] text-carbon-gray-70">{rank}/{LANGUAGE_LEVEL_ORDER.length}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
