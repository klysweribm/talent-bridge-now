import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@features/auth/store/auth.store';
import * as infra from '../../../infrastructure/processCreate.infra';
import {
  CandidateAlreadyAssignedError, CandidateLimitExceededError, ProcessServiceUnavailableError,
} from '../../../infrastructure/processCreate.errors';
import { useWizardStore } from '../../../store/wizard.store';
import { OPPORTUNITY_FIXTURE, makeCandidate, makePage, renderAt } from '../../../test-utils';
import { ProcessConfirmStep } from './ProcessConfirmStep';

vi.mock('../../../infrastructure/processCreate.infra');

const CREATED = { id: 'p9' } as Awaited<ReturnType<typeof infra.createProcess>>;

function seed(candidates = [makeCandidate(1)]): void {
  useWizardStore.setState({
    step: 'confirm',
    data: { title: 'Dev Java', clientName: 'Banco', ownerPmId: 'u2', ...OPPORTUNITY_FIXTURE, skills: [...OPPORTUNITY_FIXTURE.skills] },
    candidates,
  });
}

function show(): void {
  renderAt(<ProcessConfirmStep />, '/wizard', { path: '/processes/:id', element: <p>detalle</p> });
}

describe('ProcessConfirmStep', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useAuthStore.getState().setAuth({ id: 'me', email: 'm@ibm.com', role: 'recruiter', name: 'Yo' }, 't');
    vi.mocked(infra.fetchUserOptions).mockResolvedValue(makePage([{ id: 'u2', fullName: 'Luis PM' }]));
    seed();
  });
  afterEach(() => { useAuthStore.getState().clearAuth(); useWizardStore.getState().reset(); });

  it('should summarize data with the PM name and the candidates', async () => {
    show();
    expect(screen.getByText('Dev Java')).toBeInTheDocument();
    expect(screen.getByText('Banco')).toBeInTheDocument();
    expect(await screen.findByText('Luis PM')).toBeInTheDocument();
    expect(screen.getByText('Candidato 1 · Rol 1')).toBeInTheDocument();
    expect(screen.getByText('Java, Spring')).toBeInTheDocument();
    expect(screen.getByText('Band 8')).toBeInTheDocument();
    expect(screen.getByText('Evaluar diseño de APIs.')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /crear oportunidad/i })).toHaveLength(1);
  });

  it('should go back to the matching step with Editar', async () => {
    show();
    const edits = screen.getAllByRole('button', { name: /editar/i });
    await userEvent.click(edits[1]);
    expect(useWizardStore.getState().step).toBe('candidates');
    await userEvent.click(edits[0]);
    expect(useWizardStore.getState().step).toBe('data');
  });

  it('should warn when there are no candidates and still allow creating', () => {
    seed([]);
    show();
    expect(screen.getByText('Aún sin candidatos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear oportunidad' })).toBeEnabled();
  });

  it('should show Creando… and lock navigation while the mutation runs', async () => {
    vi.mocked(infra.createProcess).mockReturnValue(new Promise(() => undefined));
    show();
    await userEvent.click(screen.getByRole('button', { name: 'Crear oportunidad' }));
    const busy = await screen.findByRole('button', { name: 'Creando…' });
    expect(busy).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Atrás' })).toBeDisabled();
    screen.getAllByRole('button', { name: /editar/i }).forEach(button => expect(button).toBeDisabled());
  });

  it('should send the request, reset the store and navigate to the detail on success', async () => {
    vi.mocked(infra.createProcess).mockResolvedValue(CREATED);
    show();
    await userEvent.click(screen.getByRole('button', { name: 'Crear oportunidad' }));
    expect(await screen.findByText('detalle')).toBeInTheDocument();
    expect(infra.createProcess).toHaveBeenCalledWith({ title: 'Dev Java', clientName: 'Banco', ...OPPORTUNITY_FIXTURE, skills: ['Java', 'Spring'], ownerPmId: 'u2', candidateIds: ['c1'] });
    expect(useWizardStore.getState().data.title).toBe('');
  });

  it.each([
    ['409', new CandidateAlreadyAssignedError(), 'Uno o más candidatos ya pertenecen a otra oportunidad.'],
    ['limit', new CandidateLimitExceededError('at most 2 candidates'), 'Superaste el máximo de candidatos permitido para una oportunidad.'],
  ])('should show the typed %s error in an alert and keep the store', async (_name, error, message) => {
    vi.mocked(infra.createProcess).mockRejectedValue(error);
    show();
    await userEvent.click(screen.getByRole('button', { name: 'Crear oportunidad' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(message);
    expect(useWizardStore.getState().data.title).toBe('Dev Java');
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('should offer Reintentar on 503 that resubmits', async () => {
    vi.mocked(infra.createProcess).mockRejectedValueOnce(new ProcessServiceUnavailableError()).mockResolvedValue(CREATED);
    show();
    await userEvent.click(screen.getByRole('button', { name: 'Crear oportunidad' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('detalle')).toBeInTheDocument();
    expect(infra.createProcess).toHaveBeenCalledTimes(2);
  });

  it('should discard and go to /processes with Cancelar y descartar', async () => {
    renderAt(<ProcessConfirmStep />, '/wizard', { path: '/processes', element: <p>lista</p> });
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar y descartar' }));
    await waitFor(() => expect(screen.getByText('lista')).toBeInTheDocument());
    expect(useWizardStore.getState().step).toBe('data');
  });
});
