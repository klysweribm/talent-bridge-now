import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Topbar } from './Topbar';

describe('Topbar', () => {
  it('should show only the breadcrumb for the current route', () => {
    render(<MemoryRouter initialEntries={['/processes/new']}><Topbar /></MemoryRouter>);

    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByText('Nuevo proceso')).toHaveAttribute('aria-current', 'page');
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
