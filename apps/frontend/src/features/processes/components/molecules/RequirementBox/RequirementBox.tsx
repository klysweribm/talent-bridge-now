import { Link } from 'react-router-dom';

export interface RequirementBoxProps {
  readonly title: string;
  readonly description: string;
  /** Sin destino = caja no interactiva "Próximamente". */
  readonly to?: string;
}

const BOX_CLASSES = 'flex flex-col gap-sm p-lg rounded-lg border border-surface-high bg-surface-card h-full';

export function RequirementBox({ title, description, to }: RequirementBoxProps): JSX.Element {
  const content = (
    <>
      <h2 className="text-title-md text-text-primary">{title}</h2>
      <p className="text-body-md text-text-secondary">{description}</p>
      {!to && (
        <span className="self-start px-sm rounded bg-surface-high text-label-md text-text-secondary">Próximamente</span>
      )}
    </>
  );

  if (!to) return <div className={`${BOX_CLASSES} opacity-70`}>{content}</div>;
  return (
    <Link to={to} className={`${BOX_CLASSES} hover:border-primary-interactive focus-visible:outline-2`}>
      {content}
    </Link>
  );
}
