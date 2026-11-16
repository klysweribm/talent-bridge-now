import { Link } from 'react-router-dom';

export interface EmptyMessageProps {
  readonly text: string;
  readonly action?: { readonly to: string; readonly label: string };
}

export function EmptyMessage({ text, action }: EmptyMessageProps): JSX.Element {
  return (
    <div className="flex flex-col items-center text-center gap-xs p-lg">
      <p className="text-body text-carbon-gray-70">{text}</p>
      {action && (
        <Link to={action.to} className="text-body text-carbon-blue-60 hover:underline">
          {action.label}
        </Link>
      )}
    </div>
  );
}
