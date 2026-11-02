export interface ExtraItemProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly meta?: string;
  readonly body?: string;
}

export function ExtraItem({ title, subtitle, meta, body }: ExtraItemProps): JSX.Element {
  return (
    <li className="flex flex-col gap-2xs pl-md border-l-2 border-outline-variant">
      {title && <span className="text-body-md-medium text-text-primary">{title}</span>}
      {subtitle && <span className="text-body-md text-text-secondary">{subtitle}</span>}
      {meta && <span className="text-label-md text-text-secondary">{meta}</span>}
      {body && <p className="text-body-md text-text-primary m-0">{body}</p>}
    </li>
  );
}
