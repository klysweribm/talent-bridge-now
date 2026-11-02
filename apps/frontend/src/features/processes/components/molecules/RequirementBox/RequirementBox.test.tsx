import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RequirementBox } from './RequirementBox';

describe('RequirementBox', () => {
  it('should render a link when it has a destination', () => {
    render(<MemoryRouter><RequirementBox title="Agregar candidato" description="d" to="/candidates/new" /></MemoryRouter>);
    expect(screen.getByRole('link', { name: /agregar candidato/i })).toHaveAttribute('href', '/candidates/new');
  });

  it('should render a non-interactive "Próximamente" box without destination', () => {
    render(<MemoryRouter><RequirementBox title="Seleccionar referente técnico" description="d" /></MemoryRouter>);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('Próximamente')).toBeInTheDocument();
  });
});
