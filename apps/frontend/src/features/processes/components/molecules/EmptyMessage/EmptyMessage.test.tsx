import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { EmptyMessage } from './EmptyMessage';

describe('EmptyMessage', () => {
  it('should render text and an action link', () => {
    render(<MemoryRouter><EmptyMessage text="Vacío" action={{ to: '/processes/new', label: 'Crear' }} /></MemoryRouter>);
    expect(screen.getByText('Vacío')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear' })).toHaveAttribute('href', '/processes/new');
  });

  it('should render only text without action', () => {
    render(<MemoryRouter><EmptyMessage text="Todo al día" /></MemoryRouter>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
