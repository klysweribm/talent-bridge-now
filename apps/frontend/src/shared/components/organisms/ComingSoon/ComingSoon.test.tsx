import { render, screen } from '@testing-library/react';
import { BRAND } from '@/config/brand';
import { ComingSoon } from './ComingSoon';

describe('ComingSoon', () => {
  it('should render the section label as a heading', () => {
    render(<ComingSoon label="Procesos de Selección" />);
    expect(screen.getByRole('heading', { name: 'Procesos de Selección' })).toBeInTheDocument();
  });

  it('should render an explanatory message', () => {
    render(<ComingSoon label="Candidatos" />);
    expect(screen.getByText(/en construcción/i)).toBeInTheDocument();
  });

  it('should name the product from the brand config', () => {
    render(<ComingSoon label="Candidatos" />);
    expect(screen.getByText(new RegExp(`El equipo de ${BRAND.productFullName} está`))).toBeInTheDocument();
  });
});
