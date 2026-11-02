import { useId, type ReactNode } from 'react';

export interface ExtraSectionProps {
  readonly title: string;
  readonly children: ReactNode;
}

/** Subsección de solo lectura: encabezado + lista nombrada por ese encabezado. */
export function ExtraSection({ title, children }: ExtraSectionProps): JSX.Element {
  const headingId = useId();
  return (
    <section className="flex flex-col gap-sm" aria-labelledby={headingId}>
      <h4 id={headingId} className="text-title-md text-text-primary">{title}</h4>
      <ul aria-labelledby={headingId} className="flex flex-col gap-md list-none p-0 m-0">{children}</ul>
    </section>
  );
}
