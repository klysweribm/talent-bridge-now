import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { AppLayout } from './AppLayout';

function renderAt(path: string): void {
  useAuthStore.getState().setAuth({ id: 'a', name: 'Ana Pérez', email: 'ana@ibm.com', role: 'recruiter' }, 'fake-session-value');
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter initialEntries={[path]}><AppLayout><p>Contenido</p></AppLayout></MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('AppLayout', () => {
  it('should render header, sidebar, content and the breadcrumb inside the content', () => {
    renderAt('/bench');

    expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument();
    expect(screen.getByRole('complementary', { name: 'Barra lateral' })).toBeInTheDocument();
    const main = screen.getByRole('main', { name: 'Contenido principal' });
    expect(main).toContainElement(screen.getByRole('navigation', { name: 'Breadcrumb' }));
    expect(main).toHaveTextContent('Contenido');
  });
});
