import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DuplicateCandidateNotice } from './DuplicateCandidateNotice';
import { makeCandidate } from '../../../test-utils';

describe('DuplicateCandidateNotice', () => {
  it('should show the existing candidate and offer "Actualizar el existente" explaining the email swap', async () => {
    const onUpdateExisting = vi.fn();
    render(<DuplicateCandidateNotice existing={makeCandidate()} onUpdateExisting={onUpdateExisting} />);
    expect(screen.getByRole('alert')).toHaveTextContent(/ya existe un candidato con ese correo/i);
    expect(screen.getByText(/se usará el correo del perfil existente/i)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Actualizar el existente' }));
    expect(onUpdateExisting).toHaveBeenCalledTimes(1);
  });
});
