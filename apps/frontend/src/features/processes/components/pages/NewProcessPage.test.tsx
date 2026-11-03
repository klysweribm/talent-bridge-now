import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@features/auth/store/auth.store';
import * as infra from '../../infrastructure/processCreate.infra';
import { useWizardStore } from '../../store/wizard.store';
import { OPPORTUNITY_FIXTURE, fillOpportunity, makeCandidate, makePage, renderAt } from '../../test-utils';
import { NewProcessPage } from './NewProcessPage';

vi.mock('../../infrastructure/processCreate.infra');

function show(): void {
  renderAt(<NewProcessPage />, '/wizard', { path: '/processes/:id', element: <p>detalle</p> });
}

describe('NewProcessPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useWizardStore.getState().reset();
    vi.mocked(infra.fetchProcessLimits).mockResolvedValue({ maxCandidates: 3 });
    vi.mocked(infra.fetchAvailableCandidates).mockResolvedValue(makePage([makeCandidate(1)]));
    vi.mocked(infra.createProcess).mockResolvedValue({ id: 'p1' } as Awaited<ReturnType<typeof infra.createProcess>>);
  });
  afterEach(() => useAuthStore.getState().clearAuth());

  it('should render the heading, the stepper and the data step first', () => {
    useAuthStore.getState().setAuth({ id: 'me', email: 'm@ibm.com', role: 'pm', name: 'Yo' }, 't');
    vi.mocked(infra.fetchUserOptions).mockResolvedValue(makePage([]));
    show();
    expect(screen.getByRole('heading', { level: 1, name: 'Nuevo proceso' })).toBeInTheDocument();
    expect(screen.getByText('Datos').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('heading', { level: 2, name: 'Datos del proceso' })).toHaveFocus();
  });

  it('should complete the whole flow as a recruiter', async () => {
    useAuthStore.getState().setAuth({ id: 'me', email: 'm@ibm.com', role: 'recruiter', name: 'Yo' }, 't');
    vi.mocked(infra.fetchUserOptions).mockResolvedValue(makePage([{ id: 'u2', fullName: 'Luis PM' }]));
    show();
    await userEvent.type(screen.getByLabelText('Título *'), 'Dev');
    await userEvent.type(screen.getByLabelText('Cliente *'), 'Banco');
    await fillOpportunity(userEvent.setup());
    await userEvent.selectOptions(await screen.findByLabelText('Project Manager *'), 'u2');
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    const checkbox = await screen.findByRole('checkbox', { name: 'Candidato 1 · Rol 1' });
    expect(screen.getByRole('heading', { level: 2, name: 'Candidatos' })).toHaveFocus();
    await userEvent.click(checkbox);
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Confirmar y crear' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Crear proceso' }));
    expect(await screen.findByText('detalle')).toBeInTheDocument();
    expect(infra.createProcess).toHaveBeenCalledWith({ title: 'Dev', clientName: 'Banco', ...OPPORTUNITY_FIXTURE, skills: ['Java', 'Spring'], ownerPmId: 'u2', candidateIds: ['c1'] });
  });

  it('should complete the flow as a PM with no recruiter and no candidates', async () => {
    useAuthStore.getState().setAuth({ id: 'me', email: 'm@ibm.com', role: 'pm', name: 'Yo' }, 't');
    vi.mocked(infra.fetchUserOptions).mockResolvedValue(makePage([{ id: 'r1', fullName: 'Rita' }]));
    show();
    await userEvent.type(screen.getByLabelText('Título *'), 'Dev');
    await userEvent.type(screen.getByLabelText('Cliente *'), 'Banco');
    await fillOpportunity(userEvent.setup());
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('Aún sin candidatos')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Crear proceso' }));
    expect(await screen.findByText('detalle')).toBeInTheDocument();
    expect(infra.createProcess).toHaveBeenCalledWith({ title: 'Dev', clientName: 'Banco', ...OPPORTUNITY_FIXTURE, skills: ['Java', 'Spring'] });
  });
});
