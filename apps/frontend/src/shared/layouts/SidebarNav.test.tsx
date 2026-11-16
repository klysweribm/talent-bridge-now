import { render, screen, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore, type UserRole } from '@features/auth/store/auth.store';
import { SidebarNav } from './SidebarNav';

function renderSidebar(role: UserRole): ReturnType<typeof render> {
  useAuthStore.getState().setAuth({ id: 'a', name: 'Ana Pérez', email: 'ana@ibm.com', role }, 'fake-session-value');
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={['/dashboard']}><SidebarNav /></MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SidebarNav', () => {
  it('should show the role navigation and user footer', () => {
    renderSidebar('technical_ref');

    const nav = within(screen.getByRole('navigation', { name: 'Navegación principal' }));
    expect(nav.getAllByRole('link').map(l => l.getAttribute('aria-label')))
      .toEqual(['Inicio', 'Entrevistas', 'Feedback']);
    expect(screen.getByText('Ana Pérez')).toBeInTheDocument();
    expect(screen.getByText('Referente Técnico')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument();
  });

  it('should list "Banca" for a recruiter', () => {
    renderSidebar('recruiter');
    expect(screen.getByRole('link', { name: 'Banca' })).toBeInTheDocument();
  });

  it('should not list "Banca" for a technical_ref', () => {
    renderSidebar('technical_ref');
    expect(screen.queryByRole('link', { name: 'Banca' })).not.toBeInTheDocument();
  });

  it('should not render support card, theme toggle or profile card', () => {
    renderSidebar('recruiter');

    expect(screen.queryByText('Centro de Soporte')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /tema/i })).not.toBeInTheDocument();
  });
});
