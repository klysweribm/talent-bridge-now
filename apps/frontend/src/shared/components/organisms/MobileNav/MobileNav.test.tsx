import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import { MobileNav } from './MobileNav';

describe('MobileNav', () => {
  it('should show only the items of the session role', () => {
    useAuthStore.getState().setAuth({ id: 'p', name: 'Pía', email: 'pia@ibm.com', role: 'pm' }, 'fake-session-value');
    render(<MemoryRouter><MobileNav /></MemoryRouter>);

    expect(screen.getAllByRole('link').map(l => l.getAttribute('aria-label')))
      .toEqual(['Inicio', 'Banca', 'Procesos', 'Reportes']);
  });
});
