import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeCandidate } from '../../../test-utils';
import { CandidatesBody } from './CandidatesBody';

const BASE = { rows: [makeCandidate(1), makeCandidate(2)], checkedIds: ['c1'], lockUnchecked: true, onToggle: vi.fn(), onRetry: vi.fn() };

describe('CandidatesBody', () => {
  it('should render loading, empty and error states', async () => {
    const { rerender } = render(<CandidatesBody {...BASE} status="loading" />);
    expect(screen.getByRole('status', { name: 'Cargando candidatos' })).toBeInTheDocument();
    rerender(<CandidatesBody {...BASE} status="empty" />);
    expect(screen.getByText('No hay candidatos disponibles')).toBeInTheDocument();
    rerender(<CandidatesBody {...BASE} status="error" />);
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(BASE.onRetry).toHaveBeenCalled();
  });

  it('should lock only unchecked rows and report toggles', async () => {
    render(<CandidatesBody {...BASE} status="ready" />);
    expect(screen.getByRole('checkbox', { name: 'Candidato 1 · Rol 1' })).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: 'Candidato 2 · Rol 2' })).toBeDisabled();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Candidato 1 · Rol 1' }));
    expect(BASE.onToggle).toHaveBeenCalledWith(BASE.rows[0]);
  });
});
