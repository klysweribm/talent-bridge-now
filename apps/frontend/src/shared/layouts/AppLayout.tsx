import { type ReactNode } from 'react';
import { SidebarNav } from './SidebarNav';

export interface AppLayoutProps {
  readonly children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: '#f9f9f9' }}
    >
      {/* Desktop sidebar — oculto en mobile via hidden md:flex en SidebarNav */}
      <SidebarNav />

      {/* Contenido principal */}
      <main
        id="main-content"
        className="flex-1 overflow-y-auto"
        aria-label="Contenido principal"
        style={{ minWidth: 0 }}
      >
        {children}
      </main>
    </div>
  );
}
