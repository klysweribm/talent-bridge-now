import type { ICandidateProfileDraft } from '@ibm-talent-bridge/shared-types';
import { EXTRA_SECTION_LABELS } from '../../../config/candidates.constants';
import { EducationList } from '../../molecules/EducationList';
import { ExperienceList } from '../../molecules/ExperienceList';
import { LanguageList } from '../../molecules/LanguageList';

export interface AdditionalCandidateDataProps {
  readonly draft: ICandidateProfileDraft;
}

/**
 * Solo lectura: lo que el formulario no edita pero viaja a `POST /candidates`.
 * El resumen NO se repite aquí: ya es un campo editable del formulario.
 */
export function AdditionalCandidateData({ draft }: AdditionalCandidateDataProps): JSX.Element | null {
  const { experience = [], education = [], languages = [] } = draft;
  if (!experience.length && !education.length && !languages.length) return null;
  return (
    <section aria-labelledby="additional-candidate-data" className="flex flex-col gap-base p-base rounded border border-outline-variant bg-surface-card">
      <h3 id="additional-candidate-data" className="text-headline-sm text-text-primary">{EXTRA_SECTION_LABELS.title}</h3>
      {experience.length > 0 && <ExperienceList items={experience} />}
      {education.length > 0 && <EducationList items={education} />}
      {languages.length > 0 && <LanguageList items={languages} />}
    </section>
  );
}
