import type { ChangeEvent } from 'react';
import type { IUserOption } from '@ibm-talent-bridge/shared-types';
import { InputField } from '@shared/components/atoms/InputField';
import { PROCESS_TEXT_MAX_LENGTH } from '../../../config/processCreate.constants';
import { DATA_STEP_TEXT } from '../../../config/processWizard.constants';
import { PROCESS_FIELD_IDS } from '../../../constants/processFieldIds';
import type { TDraftMark } from '../../../utils/draftMarks';
import { DraftFieldFrame } from '../DraftFieldFrame/DraftFieldFrame';
import { SelectField } from '../SelectField';

export interface DataFieldsProps {
  readonly title:         string;
  readonly clientName:    string;
  readonly titleMark?:    TDraftMark | undefined;
  readonly clientMark?:   TDraftMark | undefined;
  readonly titleError?:   string;
  readonly clientError?:  string;
  readonly onTitle:       (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onClient:      (event: ChangeEvent<HTMLInputElement>) => void;
  readonly onBlurTitle:   () => void;
  readonly onBlurClient:  () => void;
  /** Selector de usuario: PM (obligatorio) para el reclutador, reclutador (opcional) para el PM. */
  readonly isRecruiter:   boolean;
  readonly userOptions:   readonly IUserOption[];
  readonly userValue:     string;
  readonly userError?:    string;
  readonly onUser:        (value: string) => void;
  readonly onBlurUser:    () => void;
}

const hint = (help: string, used: number): string => `${help} ${DATA_STEP_TEXT.counter(used, PROCESS_TEXT_MAX_LENGTH)}`;

export function DataFields(props: DataFieldsProps): JSX.Element {
  const { isRecruiter } = props;
  return (
    <>
      <DraftFieldFrame mark={props.titleMark}>
      <InputField
        id={PROCESS_FIELD_IDS.title} label={DATA_STEP_TEXT.title} value={props.title}
        hint={hint(DATA_STEP_TEXT.titleHint, props.title.length)} error={props.titleError}
        onChange={props.onTitle} onBlur={props.onBlurTitle}
      />
      </DraftFieldFrame>
      <DraftFieldFrame mark={props.clientMark}>
      <InputField
        id={PROCESS_FIELD_IDS.clientName} label={DATA_STEP_TEXT.client} value={props.clientName}
        hint={hint(DATA_STEP_TEXT.clientHint, props.clientName.length)} error={props.clientError}
        onChange={props.onClient} onBlur={props.onBlurClient}
      />
      </DraftFieldFrame>
      <SelectField
        id={isRecruiter ? PROCESS_FIELD_IDS.ownerPmId : PROCESS_FIELD_IDS.recruiterId}
        label={isRecruiter ? DATA_STEP_TEXT.pm : DATA_STEP_TEXT.recruiter}
        placeholder={isRecruiter ? DATA_STEP_TEXT.pmPlaceholder : DATA_STEP_TEXT.unassigned}
        hint={isRecruiter ? DATA_STEP_TEXT.pmHint : DATA_STEP_TEXT.recruiterHint}
        options={props.userOptions} value={props.userValue} error={props.userError}
        onChange={props.onUser} onBlur={props.onBlurUser}
      />
    </>
  );
}
