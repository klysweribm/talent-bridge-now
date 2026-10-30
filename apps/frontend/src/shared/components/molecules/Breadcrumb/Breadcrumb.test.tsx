import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumb } from './Breadcrumb';

describe('Breadcrumb', () => {
  it('should link parents and mark the last item as current page', () => {
    render(
      <MemoryRouter>
        <Breadcrumb items={[{ label: 'Inicio', to: '/dashboard' }, { label: 'Procesos' }]} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByText('Procesos')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('link', { name: 'Procesos' })).not.toBeInTheDocument();
  });
});
