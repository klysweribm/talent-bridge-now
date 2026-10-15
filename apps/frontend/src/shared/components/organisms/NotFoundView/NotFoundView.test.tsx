import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFoundView } from './NotFoundView';

describe('NotFoundView', () => {
  it('should render a heading announcing the page was not found', () => {
    render(<NotFoundView backTo="/dashboard" backLabel="Volver al dashboard" />, { wrapper: MemoryRouter });
    expect(screen.getByRole('heading', { name: /no encontrada/i })).toBeInTheDocument();
  });

  it('should render a link back to the given path', () => {
    render(<NotFoundView backTo="/dashboard" backLabel="Volver al dashboard" />, { wrapper: MemoryRouter });
    expect(screen.getByRole('link', { name: 'Volver al dashboard' })).toHaveAttribute('href', '/dashboard');
  });
});
