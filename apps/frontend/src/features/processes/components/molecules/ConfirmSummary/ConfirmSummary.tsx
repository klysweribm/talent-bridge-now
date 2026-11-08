import type { IProcessCandidateSummary } from '@ibm-talent-bridge/shared-types';
import { CONFIRM_STEP_TEXT, WIZARD_TEXT } from '../../../config/processWizard.constants';
import { formatStartDate } from '../../../utils/formatStartDate';
import { ConfirmSection } from '../ConfirmSection';

export interface ConfirmSummaryProps {
  readonly title:         string;
  readonly clientName:    string;
  readonly opportunityRole: string;
  readonly skills:          readonly string[];
  readonly roleDescription: string;
  readonly band?:           number;
  readonly startDate?:      string;
  readonly userLabel:     string;
  readonly userName:      string;
  readonly candidates:    readonly IProcessCandidateSummary[];
  readonly disabled:      boolean;
  readonly onEditData:       () => void;
  readonly onEditCandidates: () => void;
}

const Row = ({ label, value }: { readonly label: string; readonly value: string }): JSX.Element => (
  <p className="text-body-md whitespace-pre-line break-words"><span className="text-text-secondary">{label}: </span><span className="text-text-primary">{value}</span></p>
);

export function ConfirmSummary(props: ConfirmSummaryProps): JSX.Element {
  const { candidates, disabled } = props;
  return (
    <>
      <ConfirmSection title={CONFIRM_STEP_TEXT.dataSection} editLabel={WIZARD_TEXT.edit} disabled={disabled} onEdit={props.onEditData}>
        <Row label={CONFIRM_STEP_TEXT.titleLabel} value={props.title} />
        <Row label={CONFIRM_STEP_TEXT.clientLabel} value={props.clientName} />
        <Row label={props.userLabel} value={props.userName} />
        <Row label={CONFIRM_STEP_TEXT.roleLabel} value={props.opportunityRole} />
        <Row label={CONFIRM_STEP_TEXT.skillsLabel} value={props.skills.join(', ')} />
        <Row label={CONFIRM_STEP_TEXT.bandLabel} value={props.band === undefined ? '' : CONFIRM_STEP_TEXT.band(props.band)} />
        {props.startDate && <Row label={CONFIRM_STEP_TEXT.startDateLabel} value={formatStartDate(props.startDate)} />}
        <Row label={CONFIRM_STEP_TEXT.descriptionLabel} value={props.roleDescription} />
      </ConfirmSection>
      <ConfirmSection title={CONFIRM_STEP_TEXT.candidatesSection} editLabel={WIZARD_TEXT.edit} disabled={disabled} onEdit={props.onEditCandidates}>
        {candidates.length === 0 ? (
          <p className="text-body-md text-text-secondary">{CONFIRM_STEP_TEXT.noCandidates}</p>
        ) : (
          <ul className="flex flex-col gap-xs">
            {candidates.map(candidate => (
              <li key={candidate.id} className="text-body-md text-text-primary">
                {candidate.primaryRole ? `${candidate.fullName} · ${candidate.primaryRole}` : candidate.fullName}
              </li>
            ))}
          </ul>
        )}
      </ConfirmSection>
    </>
  );
}
