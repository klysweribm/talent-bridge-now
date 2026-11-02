import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makeCandidate } from '../../../test-utils';
import { ConfirmSummary } from './ConfirmSummary';

const PROPS = {
  title: 'Dev', clientName: 'Banco', userLabel: 'Project Manager', userName: 'Luis',
  candidates: [makeCandidate(1)], disabled: false, onEditData: vi.fn(), onEditCandidates: vi.fn(),
};

describe('ConfirmSummary', () => {
  it('should list data and candidates and route each Editar', async () => {
    render(<ConfirmSummary {...PROPS} />);
    expect(screen.getByText('Luis')).toBeInTheDocument();
    expect(screen.getByText('Candidato 1 · Rol 1')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /editar candidatos/i }));
    expect(PROPS.onEditCandidates).toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /editar datos/i }));
    expect(PROPS.onEditData).toHaveBeenCalled();
  });

  it('should warn when there are no candidates', () => {
    render(<ConfirmSummary {...PROPS} candidates={[]} />);
    expect(screen.getByText('Aún sin candidatos')).toBeInTheDocument();
  });
});
