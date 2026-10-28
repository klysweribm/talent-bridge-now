import type { JSX } from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb } from '@shared/components/molecules/Breadcrumb';
import { buildBreadcrumbs } from '@shared/utils/buildBreadcrumbs';

/** Topbar del shell: solo breadcrumb (UX-GUIDELINES §1). El título lo pone cada página. */
export function Topbar(): JSX.Element {
  const { pathname } = useLocation();

  return (
    <header className="flex items-center h-14 flex-shrink-0 px-lg bg-surface-card border-b border-outline-variant">
      <Breadcrumb items={buildBreadcrumbs(pathname)} />
    </header>
  );
}
