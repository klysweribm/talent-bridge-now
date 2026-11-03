import { InputField } from '@shared/components/atoms/InputField';
import { OPPORTUNITY_LIMITS } from '../../../config/processOpportunity.constants';
import { OPPORTUNITY_COPY } from '../../../config/processOpportunity.copy';
import { PROCESS_FIELD_IDS } from '../../../constants/processFieldIds';
import type { IOpportunityBindings } from '../../../hooks/opportunityBindings';
import { TextAreaField } from '../../atoms/TextAreaField/TextAreaField';
import { BandSelector } from '../BandSelector/BandSelector';
import { SkillChipsInput } from '../SkillChipsInput/SkillChipsInput';

export interface OpportunityFieldsProps {
  readonly bindings: IOpportunityBindings;
}

const hint = (help: string, used: number, max: number): string => `${help} ${OPPORTUNITY_COPY.counter(used, max)}`;

/** Los 4 campos de la oportunidad; los usan el paso 1 de creación y la edición del detalle. */
export function OpportunityFields({ bindings }: OpportunityFieldsProps): JSX.Element {
  const { values, errors, touch } = bindings;
  return (
    <>
      <InputField
        id={PROCESS_FIELD_IDS.opportunityRole} label={OPPORTUNITY_COPY.role} value={values.opportunityRole}
        hint={hint(OPPORTUNITY_COPY.roleHint, values.opportunityRole.length, OPPORTUNITY_LIMITS.roleMax)} error={errors.opportunityRole}
        onChange={bindings.onRole} onBlur={() => touch('opportunityRole')}
      />
      <SkillChipsInput
        id={PROCESS_FIELD_IDS.skills} label={OPPORTUNITY_COPY.skills} hint={OPPORTUNITY_COPY.skillsHint}
        skills={values.skills} error={errors.skills} onChange={bindings.onSkills}
      />
      <BandSelector id={PROCESS_FIELD_IDS.band} label={OPPORTUNITY_COPY.band} value={values.band} error={errors.band} onChange={bindings.onBand} />
      <TextAreaField
        id={PROCESS_FIELD_IDS.roleDescription} label={OPPORTUNITY_COPY.description} value={values.roleDescription}
        hint={hint(OPPORTUNITY_COPY.descriptionHint, values.roleDescription.length, OPPORTUNITY_LIMITS.descriptionMax)}
        error={errors.roleDescription} onChange={bindings.onDescription} onBlur={() => touch('roleDescription')}
      />
    </>
  );
}
