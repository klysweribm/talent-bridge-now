import { useEffect, useRef, type ReactNode } from 'react';

export interface StepHeadingProps {
  readonly children: ReactNode;
}

/** Encabezado del paso: al montarse recibe el foco para anunciar el cambio de paso. */
export function StepHeading({ children }: StepHeadingProps): JSX.Element {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return <h2 ref={ref} tabIndex={-1} className="text-title-md text-text-primary focus:outline-none">{children}</h2>;
}
