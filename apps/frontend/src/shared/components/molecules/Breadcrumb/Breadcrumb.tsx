import { Fragment, type JSX } from 'react';
import { Link } from 'react-router-dom';
import type { IBreadcrumb } from '@shared/utils/buildBreadcrumbs';

export interface BreadcrumbProps {
  readonly items: readonly IBreadcrumb[];
}

export function Breadcrumb({ items }: BreadcrumbProps): JSX.Element {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-sm text-body-md text-text-secondary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.label}>
              {index > 0 && <li aria-hidden="true">/</li>}
              <li aria-current={isLast ? 'page' : undefined} className={isLast ? 'text-text-primary font-medium' : ''}>
                {item.to && !isLast
                  ? <Link to={item.to} className="hover:text-primary-interactive">{item.label}</Link>
                  : item.label}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
