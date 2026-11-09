import { useEffect } from 'react';
import { Button } from '@shared/components/atoms/Button';
import type { ICandidate, ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { SUBMIT_LABELS } from '../../../config/candidates.constants';
import { useCandidateForm } from '../../../hooks/useCandidateForm';
import { useReportFormState, type ICandidateCreateFormState } from '../../../hooks/useReportFormState';
import { useCandidateSubmission } from '../../../hooks/useCandidateSubmission';
import { formValuesToRequest } from '../../../utils/draftMapping';
import { isValidEmail } from '../../../utils/isValidEmail';
import { resolveMissing } from '../../../utils/resolveMissing';
import { CvResultCard } from '../../molecules/CvResultCard/CvResultCard';
import { NewCandidateHeader } from '../../molecules/NewCandidateHeader/NewCandidateHeader';
import { AdditionalCandidateData } from '../AdditionalCandidateData';
import { CandidateFormFields } from '../../molecules/CandidateFormFields';
import { CandidateMatchNotice } from '../../molecules/CandidateMatchNotice';
import { DuplicateCandidateNotice } from '../../molecules/DuplicateCandidateNotice';
import { SubmissionFeedback } from '../../molecules/SubmissionFeedback';
import { ExtractionNotices } from '../../molecules/ExtractionNotices';

export interface CandidateReviewFormProps {
  /** `undefined` = escritura manual (sin CV). */
  readonly result?: ICvExtractionResult;
  /** Archivo del CV analizado, para la tarjeta de resultado. */
  readonly file?: File;
  readonly onRestart: () => void;
  /** Se llama una vez al guardar; el padre decide qué mostrar. */
  readonly onSaved: (candidate: ICandidate, mode: 'created' | 'updated') => void;
  readonly onCancel?: () => void;
  readonly onStateChange?: (state: ICandidateCreateFormState) => void;
}

interface ISubmitRowProps { readonly isUpdate: boolean; readonly pending: boolean; readonly onRestart: () => void; readonly onCancel?: () => void }

function SubmitRow({ isUpdate, pending, onRestart, onCancel }: ISubmitRowProps): JSX.Element {
  return (
    <div className="flex gap-sm">
      <Button type="submit" loading={pending}>{isUpdate ? SUBMIT_LABELS.update : SUBMIT_LABELS.create}</Button>
      <Button type="button" variant="ghost" onClick={onRestart}>Volver</Button>
      {onCancel && <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>}
    </div>
  );
}

const NO_DRAFT = { draft: {}, missingFields: [], warnings: [] } as const;

export function CandidateReviewForm({ result, file, onRestart, onSaved, onCancel, onStateChange }: CandidateReviewFormProps): JSX.Element {
  const { draft, missingFields, warnings } = result ?? NO_DRAFT;
  const form = useCandidateForm(draft, result?.matches?.exact?.email);
  const { register, handleSubmit, setValue, formState: { errors, isDirty } } = form;
  const submission = useCandidateSubmission(result?.matches?.exact?.id);
  const { duplicate } = submission;
  const missing = resolveMissing(missingFields);
  const isUpdate = submission.mode === 'update';
  const onSubmit = handleSubmit(values => submission.submit(formValuesToRequest(values, draft)));

  const { saved } = submission;
  const mode = isUpdate ? 'updated' : 'created';
  useReportFormState(submission.isPending, result !== undefined || isDirty, onStateChange, submission.isPending);
  useEffect(() => { if (saved) onSaved(saved, mode); }, [saved]); // eslint-disable-line react-hooks/exhaustive-deps -- notifica una vez por guardado

  return (
    <form onSubmit={event => { void onSubmit(event); }} noValidate className="flex flex-col gap-base">
      <NewCandidateHeader result={result} />
      {file && result && <CvResultCard file={file} result={result} />}
      {result?.matches && <CandidateMatchNotice matches={result.matches} />}
      <ExtractionNotices missingLabels={missing.labels} warnings={warnings} />
      <CandidateFormFields register={register} errors={errors} missing={missing.formFields} emailLocked={isUpdate} emailValid={isValidEmail(form.watch('email'))} />
      <AdditionalCandidateData draft={draft} />
      {duplicate && (
        // El backend rechaza un PUT con otro correo: se fija el del perfil existente.
        <DuplicateCandidateNotice existing={duplicate} onUpdateExisting={() => { setValue('email', duplicate.email); submission.switchToUpdate(duplicate); }} />
      )}
      <SubmissionFeedback error={submission.error} isUpdate={isUpdate} fromDuplicate={submission.fromDuplicate} />
      <SubmitRow isUpdate={isUpdate} pending={submission.isPending} onRestart={onRestart} onCancel={onCancel} />
    </form>
  );
}
