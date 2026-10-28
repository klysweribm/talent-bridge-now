import { type JSX, type ReactNode } from 'react';
import { ErrorBoundary } from '@shared/components/organisms/ErrorBoundary';
import { MobileNav } from '@shared/components/organisms/MobileNav';
import { Topbar } from '@shared/components/organisms/Topbar';
import { SidebarNav } from './SidebarNav';

export interface AppLayoutProps {
  readonly children: ReactNode;
}

/** Shell único (UX-GUIDELINES §1): sidebar en desktop, bottom nav en mobile. */
export function AppLayout({ children }: AppLayoutProps): JSX.Element {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <SidebarNav />
      <div className="flex flex-1 min-w-0 flex-col">
        <Topbar />
        {/* ErrorBoundary evita pantalla en blanco; pb-14 deja sitio al bottom nav mobile */}
        <main
          id="main-content"
          className="flex-1 min-w-0 overflow-y-auto pb-14 md:pb-0"
          aria-label="Contenido principal"
        >
          <ErrorBoundary>{children}</ErrorBoundary>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
