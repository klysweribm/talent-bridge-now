import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createCandidate } from '../../../infrastructure/candidates.infra';
import { makeCandidate, renderPage } from '../../../test-utils';
import { NewCandidateFlow } from './NewCandidateFlow';

vi.mock('../../../infrastructure/candidates.infra', () => ({ extractCv: vi.fn(), createCandidate: vi.fn(), updateCandidate: vi.fn() }));

async function createOne(user: ReturnType<typeof userEvent.setup>): Promise<void> {
  await user.click(screen.getByRole('button', { name: /escritura manual/i }));
  await user.type(screen.getByLabelText(/nombre completo/i), 'Persona Inventada');
  await user.type(screen.getByLabelText(/correo/i), 'persona@example.com');
  await user.click(screen.getByRole('button', { name: /crear candidato/i }));
}

describe('NewCandidateFlow', () => {
  beforeEach(() => vi.mocked(createCandidate).mockReset());

  it('should show the created panel with the saved candidate and an exit link when saved', async () => {
    vi.mocked(createCandidate).mockResolvedValue(makeCandidate());
    renderPage(<NewCandidateFlow />);
    await createOne(userEvent.setup());
    expect(await screen.findByRole('status')).toHaveTextContent('Existente Inventada');
    expect(screen.getByRole('link', { name: 'Ver candidatos' })).toHaveAttribute('href', '/candidates');
    expect(screen.queryByLabelText(/nombre completo/i)).not.toBeInTheDocument();
  });

  it('should restart from the upload step when "Cargar otro candidato" is clicked', async () => {
    vi.mocked(createCandidate).mockResolvedValue(makeCandidate());
    const user = userEvent.setup();
    renderPage(<NewCandidateFlow />);
    await createOne(user);
    await user.click(await screen.findByRole('button', { name: /cargar otro candidato/i }));
    expect(screen.getByLabelText(/archivo del cv/i)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
