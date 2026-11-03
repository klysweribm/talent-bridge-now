import { render, screen, within } from '@testing-library/react';
import type { IProcessTechnicalRef } from '@ibm-talent-bridge/shared-types';
import { TechnicalTeamCard } from './TechnicalTeamCard';

const make = (n: number): IProcessTechnicalRef => ({
  id: `tr${n}`, fullName: `Ref ${n}`, email: `r${n}@ibm.com`, role: 'technical_ref', band: n, description: `Desc ${n}`, status: 'active',
});

describe('TechnicalTeamCard', () => {
  it('should show the empty state and "Sin asignar" with no referents', () => {
    render(<TechnicalTeamCard refs={[]} maxRefs={2} />);
    expect(screen.getByRole('heading', { name: 'Equipo técnico asignado' })).toBeInTheDocument();
    expect(screen.getByText('Sin asignar')).toBeInTheDocument();
    expect(screen.getByText('Aún no hay referentes técnicos asignados a este proceso.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('should show "1 de 2 asignados" with one referent', () => {
    render(<TechnicalTeamCard refs={[make(1)]} maxRefs={2} />);
    expect(screen.getByText('1 de 2 asignados')).toBeInTheDocument();
    expect(screen.queryByText('Par completo')).not.toBeInTheDocument();
    expect(within(screen.getByRole('list')).getAllByRole('listitem')).toHaveLength(1);
  });

  it('should show "Par completo" with two referents', () => {
    render(<TechnicalTeamCard refs={[make(1), make(2)]} maxRefs={2} />);
    expect(screen.getByText('Par completo')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('should render the actions slot', () => {
    render(<TechnicalTeamCard refs={[]} maxRefs={2} actions={<button type="button">Gestionar</button>} />);
    expect(screen.getByRole('button', { name: 'Gestionar' })).toBeInTheDocument();
  });

  it('should be props-only and never request data', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(<TechnicalTeamCard refs={[make(1)]} maxRefs={2} />);
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
