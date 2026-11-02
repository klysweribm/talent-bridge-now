import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NewProcessPage } from './NewProcessPage';

describe('NewProcessPage', () => {
  it('should render 3 requirement boxes with only the first one linking to /candidates/new', () => {
    render(<MemoryRouter><NewProcessPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { level: 1, name: 'Nuevo proceso' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3);
    expect(screen.getAllByRole('link')).toHaveLength(1);
    expect(screen.getByRole('link', { name: /agregar candidato/i })).toHaveAttribute('href', '/candidates/new');
    expect(screen.getByRole('heading', { name: 'Seleccionar referente técnico' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Requisitos de la posición' })).toBeInTheDocument();
    expect(screen.getAllByText('Próximamente')).toHaveLength(2);
  });
});
