import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export interface DashboardSectionProps {
  readonly title: string;
  readonly headingId: string;
  readonly seeAll?: { readonly to: string; readonly label: string };
  readonly children: ReactNode;
}

export function DashboardSection({ title, headingId, seeAll, children }: DashboardSectionProps): JSX.Element {
  return (
    <section
      aria-labelledby={headingId}
      className="bg-surface-card border border-surface-high rounded-xl shadow-raised p-base flex flex-col gap-base"
    >
      <div className="flex items-center justify-between gap-sm">
        <h2 id={headingId} className="text-headline-sm text-text-primary">{title}</h2>
        {seeAll && (
          <Link to={seeAll.to} className="text-label-md text-primary-interactive hover:underline">
            {seeAll.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
