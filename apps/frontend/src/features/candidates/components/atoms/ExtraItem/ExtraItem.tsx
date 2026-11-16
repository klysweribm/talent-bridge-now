export interface ExtraItemProps {
  readonly title?: string;
  readonly subtitle?: string;
  readonly meta?: string;
  readonly body?: string;
}

export function ExtraItem({ title, subtitle, meta, body }: ExtraItemProps): JSX.Element {
  return (
    <li className="flex flex-col gap-2xs pl-md border-l-2 border-carbon-gray-30">
      {title && <span className="text-body font-semibold text-carbon-gray-100">{title}</span>}
      {subtitle && <span className="text-body text-carbon-gray-70">{subtitle}</span>}
      {meta && <span className="text-label text-carbon-gray-70">{meta}</span>}
      {body && <p className="text-body text-carbon-gray-100 m-0">{body}</p>}
    </li>
  );
}
