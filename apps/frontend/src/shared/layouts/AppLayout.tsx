import { type JSX, type ReactNode } from 'react';
import { Breadcrumb } from '@shared/components/molecules/Breadcrumb/Breadcrumb';
import { ErrorBoundary } from '@shared/components/organisms/ErrorBoundary';
import { MobileNav } from '@shared/components/organisms/MobileNav';
import { Topbar } from '@shared/components/organisms/Topbar';
import { useLocation } from 'react-router-dom';
import { buildBreadcrumbs } from '@shared/utils/buildBreadcrumbs';
import { SidebarNav } from './SidebarNav';

export interface AppLayoutProps {
  readonly children: ReactNode;
}

/** Shell único: header fijo + sidebar fijo (desktop) o bottom nav (mobile); el breadcrumb vive en el contenido. */
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  const { pathname } = useLocation();
  const crumbs = buildBreadcrumbs(pathname);

  return (
    <div className="min-h-screen bg-carbon-gray-10">
      <Topbar />
      <SidebarNav />
      {/* ErrorBoundary evita pantalla en blanco; pb-14 deja sitio al bottom nav mobile */}
      <main
        id="main-content"
        className="md:ml-sidebar pt-header pb-14 md:pb-0 min-h-screen min-w-0"
        aria-label="Contenido principal"
      >
        {crumbs.length > 0 && <Breadcrumb items={crumbs} />}
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <MobileNav />
    </div>
  );
}
