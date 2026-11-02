import { DUPLICATE_COPY, RESULT_COPY } from '../../../config/candidates.constants';
import { CandidateNotFoundError } from '../../../infrastructure/candidates.errors';

export interface SubmissionFeedbackProps {
  readonly error: Error | null;
  readonly isUpdate: boolean;
  /** El modo actualización viene de elegir "Actualizar el existente" tras un duplicado. */
  readonly fromDuplicate: boolean;
}

function errorText(error: Error, isUpdate: boolean): string {
  if (error instanceof CandidateNotFoundError) return RESULT_COPY.notFound;
  return isUpdate ? RESULT_COPY.updateError : RESULT_COPY.createError;
}

export function SubmissionFeedback({ error, isUpdate, fromDuplicate }: SubmissionFeedbackProps): JSX.Element | null {
  if (!error && !(isUpdate && fromDuplicate)) return null;
  return (
    <>
      {isUpdate && fromDuplicate && <p role="status" className="text-body-md text-text-primary">{DUPLICATE_COPY.updatingExisting}</p>}
      {error && <p role="alert" className="text-body-md text-status-danger">{errorText(error, isUpdate)}</p>}
    </>
  );
}
