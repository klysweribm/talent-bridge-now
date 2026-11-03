import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createCandidate } from '../../../infrastructure/candidates.infra';
import { makeCandidate, renderPage } from '../../../test-utils';
import { CandidateReviewForm } from './CandidateReviewForm';

vi.mock('../../../infrastructure/candidates.infra', () => ({ extractCv: vi.fn(), createCandidate: vi.fn(), updateCandidate: vi.fn() }));

async function createOne(entry: Parameters<typeof renderPage>[1]): Promise<void> {
  vi.mocked(createCandidate).mockResolvedValue(makeCandidate());
  renderPage(<CandidateReviewForm onRestart={vi.fn()} />, entry);
  await userEvent.type(screen.getByLabelText(/nombre completo/i), 'Persona Inventada');
  await userEvent.type(screen.getByLabelText(/correo/i), 'persona@example.com');
  await userEvent.click(screen.getByRole('button', { name: /crear candidato/i }));
}

describe('CandidateReviewForm exit link by origin', () => {
  beforeEach(() => vi.resetAllMocks());

  it('should offer "Volver al nuevo proceso" when coming from the new-process form', async () => {
    await createOne({ pathname: '/candidates/new', state: { from: 'new-process' } });
    expect(await screen.findByRole('link', { name: 'Volver al nuevo proceso' })).toHaveAttribute('href', '/processes/new');
  });

  it('should offer "Ver candidatos" otherwise', async () => {
    await createOne('/candidates/new');
    expect(await screen.findByRole('link', { name: 'Ver candidatos' })).toHaveAttribute('href', '/candidates');
    expect(screen.queryByRole('link', { name: 'Volver al nuevo proceso' })).not.toBeInTheDocument();
  });
});
