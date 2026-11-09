import type { IOpportunityLimits } from '@ibm-talent-bridge/shared-types';
import { InputField } from '@shared/components/atoms/InputField';
import { buildOpportunityBands } from '../../../config/processOpportunity.constants';
import { OPPORTUNITY_COPY } from '../../../config/processOpportunity.copy';
import { PROCESS_FIELD_IDS } from '../../../constants/processFieldIds';
import type { IOpportunityBindings } from '../../../hooks/opportunityBindings';
import type { TDraftMarks } from '../../../utils/draftMarks';
import { DraftFieldFrame } from '../DraftFieldFrame/DraftFieldFrame';
import { ErrorBanner } from '../ErrorBanner';
import { TextAreaField } from '../../atoms/TextAreaField/TextAreaField';
import { BandSelector } from '../BandSelector/BandSelector';
import { SkillChipsInput } from '../SkillChipsInput/SkillChipsInput';
import { StartDateField } from '../StartDateField/StartDateField';

export interface OpportunityFieldsProps {
  readonly bindings: IOpportunityBindings;
  /** Marcas del borrador de IA por campo; ausentes en la edición del detalle. */
  readonly marks?: TDraftMarks;
}

const hint = (help: string, used: number, max: number): string => `${help} ${OPPORTUNITY_COPY.counter(used, max)}`;

/** Los 5 campos de la oportunidad; los usan el paso 1 de creación y la edición del detalle. */
export function OpportunityFields({ bindings, marks = {} }: OpportunityFieldsProps): JSX.Element {
  const { limits } = bindings;
  if (!limits.data) {
    return limits.failed
      ? <ErrorBanner message={OPPORTUNITY_COPY.limitsError} actionLabel={OPPORTUNITY_COPY.limitsRetry} onAction={limits.retry} />
      : <p role="status" className="text-body-md text-text-secondary">{OPPORTUNITY_COPY.limitsLoading}</p>;
  }
  return <OpportunityFieldList bindings={bindings} marks={marks} max={limits.data} />;
}

function DescriptionField({ bindings, max }: { readonly bindings: IOpportunityBindings; readonly max: number }): JSX.Element {
  const { values, errors } = bindings;
  return (
    <TextAreaField
      id={PROCESS_FIELD_IDS.roleDescription} label={OPPORTUNITY_COPY.description} value={values.roleDescription}
      hint={hint(OPPORTUNITY_COPY.descriptionHint, values.roleDescription.length, max)}
      error={errors.roleDescription} onChange={bindings.onDescription} onBlur={() => bindings.touch('roleDescription')}
    />
  );
}

function OpportunityFieldList({ bindings, marks, max }: { readonly bindings: IOpportunityBindings; readonly marks: TDraftMarks; readonly max: IOpportunityLimits }): JSX.Element {
  const { values, errors, touch } = bindings;
  return (
    <>
      <DraftFieldFrame mark={marks.opportunityRole}>
        <InputField
          id={PROCESS_FIELD_IDS.opportunityRole} label={OPPORTUNITY_COPY.role} value={values.opportunityRole}
          hint={hint(OPPORTUNITY_COPY.roleHint, values.opportunityRole.length, max.roleMax)} error={errors.opportunityRole}
          onChange={bindings.onRole} onBlur={() => touch('opportunityRole')}
        />
      </DraftFieldFrame>
      <DraftFieldFrame mark={marks.skills}>
        <SkillChipsInput
          id={PROCESS_FIELD_IDS.skills} label={OPPORTUNITY_COPY.skills} hint={OPPORTUNITY_COPY.skillsHint(max.skillsMax)}
          skills={values.skills} error={errors.skills} maxSkills={max.skillsMax} maxSkillLength={max.skillMax} onChange={bindings.onSkills}
        />
      </DraftFieldFrame>
      <DraftFieldFrame mark={marks.band}>
        <BandSelector bands={buildOpportunityBands(max)} id={PROCESS_FIELD_IDS.band} label={OPPORTUNITY_COPY.band} value={values.band} error={errors.band} onChange={bindings.onBand} />
      </DraftFieldFrame>
      <DraftFieldFrame mark={marks.startDate}>
        <StartDateField id={PROCESS_FIELD_IDS.startDate} value={values.startDate ?? ''} error={errors.startDate} onChange={bindings.onStartDate} onBlur={() => touch('startDate')} />
      </DraftFieldFrame>
      <DraftFieldFrame mark={marks.roleDescription}>
        <DescriptionField bindings={bindings} max={max.descriptionMax} />
      </DraftFieldFrame>
    </>
  );
}
