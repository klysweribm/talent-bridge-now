import { ErrorBanner } from '../ErrorBanner/ErrorBanner';

export interface ActionFeedbackProps {
  readonly error?:   string;
  readonly success?: string;
}

/** Error (role="alert") o éxito (role="status") de una acción; el error tiene prioridad. */
export function ActionFeedback({ error, success }: ActionFeedbackProps): JSX.Element | null {
  if (error) return <ErrorBanner message={error} />;
  if (success) return <p role="status" className="text-body-md text-status-success-text">{success}</p>;
  return null;
}
