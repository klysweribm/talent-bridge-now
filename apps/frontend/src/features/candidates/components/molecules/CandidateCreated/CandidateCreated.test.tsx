import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { CandidateCreated } from './CandidateCreated';
import { makeCandidate } from '../../../test-utils';

const renderIt = (ui: JSX.Element): ReturnType<typeof render> => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('CandidateCreated', () => {
  it('should announce "Candidato creado" with the restart action and the back link', () => {
    renderIt(<CandidateCreated candidate={makeCandidate()} mode="created" onRestart={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent(/candidato creado: existente inventada/i);
    expect(screen.getByRole('button', { name: 'Cargar otro candidato' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al nuevo proceso' })).toHaveAttribute('href', '/processes/new');
    expect(screen.queryByText(/actualizado por/i)).not.toBeInTheDocument();
  });

  it('should announce "Candidato actualizado" with who updated it', () => {
    const candidate = makeCandidate({ updatedBy: { id: 'u1', email: 'ana@ibm.com', role: 'recruiter' }, updateCount: 3 });
    renderIt(<CandidateCreated candidate={candidate} mode="updated" onRestart={vi.fn()} />);
    expect(screen.getByRole('status')).toHaveTextContent(/candidato actualizado: existente inventada/i);
    expect(screen.getByText('Actualizado por ana@ibm.com (Reclutador)')).toBeInTheDocument();
  });

  it('should omit "Actualizado por" when the returned candidate has no updatedBy', () => {
    renderIt(<CandidateCreated candidate={makeCandidate()} mode="updated" onRestart={vi.fn()} />);
    expect(screen.queryByText(/actualizado por/i)).not.toBeInTheDocument();
  });
});
