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
      className="bg-white flex flex-col"
    >
      <div className="flex items-center justify-between gap-sm p-base border-b border-carbon-gray-20">
        <h2 id={headingId} className="text-h2 text-carbon-gray-100">{title}</h2>
        {seeAll && (
          <Link to={seeAll.to} className="text-body text-carbon-blue-60 hover:underline">
            {seeAll.label}
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
