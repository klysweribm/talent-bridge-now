import { render, screen } from '@testing-library/react';
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
});
