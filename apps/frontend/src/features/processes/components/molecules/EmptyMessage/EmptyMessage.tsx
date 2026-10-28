import { Link } from 'react-router-dom';

export interface EmptyMessageProps {
  readonly text: string;
  readonly action?: { readonly to: string; readonly label: string };
}

export function EmptyMessage({ text, action }: EmptyMessageProps): JSX.Element {
  return (
    <div className="flex flex-col items-start gap-xs py-sm">
      <p className="text-body-md text-text-secondary">{text}</p>
      {action && (
        <Link to={action.to} className="text-body-md-medium text-primary-interactive hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}
