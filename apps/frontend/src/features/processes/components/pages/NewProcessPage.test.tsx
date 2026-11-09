import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@features/auth/store/auth.store';
import * as candidatesInfra from '@features/candidates/infrastructure/candidates.infra';
import * as infra from '../../infrastructure/processCreate.infra';
import { useWizardStore } from '../../store/wizard.store';
import { CREATED_CANDIDATE, CREATED_ROW_LABEL, fillCandidate, mockAvailableList, openPanel, saveCandidate, startManual } from '../../panel-test-utils';
import { OPPORTUNITY_FIXTURE, fillOpportunity, makeCandidate, makePage, mockProcessLimits, renderAt } from '../../test-utils';
import { NewProcessPage } from './NewProcessPage';

vi.mock('../../infrastructure/processCreate.infra');
vi.mock('@features/candidates/infrastructure/candidates.infra', () => ({ extractCv: vi.fn(), createCandidate: vi.fn(), updateCandidate: vi.fn() }));

function show(): void {
  renderAt(<NewProcessPage />, '/wizard', { path: '/processes/:id', element: <p>detalle</p> });
}

describe('NewProcessPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useWizardStore.getState().reset();
    mockProcessLimits({ maxCandidates: 3 });
    vi.mocked(infra.fetchAvailableCandidates).mockResolvedValue(makePage([makeCandidate(1)]));
    vi.mocked(infra.createProcess).mockResolvedValue({ id: 'p1' } as Awaited<ReturnType<typeof infra.createProcess>>);
  });
  afterEach(() => useAuthStore.getState().clearAuth());

  it('should render the heading, the stepper and the data step first', () => {
    useAuthStore.getState().setAuth({ id: 'me', email: 'm@ibm.com', role: 'pm', name: 'Yo' }, 't');
    vi.mocked(infra.fetchUserOptions).mockResolvedValue(makePage([]));
    show();
    expect(screen.getByRole('heading', { level: 1, name: 'Nueva oportunidad' })).toBeInTheDocument();
    expect(screen.getByText('Datos').closest('li')).toHaveAttribute('aria-current', 'step');
    expect(screen.getByRole('heading', { level: 2, name: 'Datos de la oportunidad' })).toHaveFocus();
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
    await userEvent.click(screen.getByRole('button', { name: 'Crear oportunidad' }));
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
    await userEvent.click(screen.getByRole('button', { name: 'Crear oportunidad' }));
    expect(await screen.findByText('detalle')).toBeInTheDocument();
    expect(infra.createProcess).toHaveBeenCalledWith({ title: 'Dev', clientName: 'Banco', ...OPPORTUNITY_FIXTURE, skills: ['Java', 'Spring'] });
  });

  async function reachCandidatesStep(): Promise<ReturnType<typeof userEvent.setup>> {
    useAuthStore.getState().setAuth({ id: 'me', email: 'm@ibm.com', role: 'pm', name: 'Yo' }, 't');
    vi.mocked(infra.fetchUserOptions).mockResolvedValue(makePage([{ id: 'r1', fullName: 'Rita' }]));
    const user = userEvent.setup();
    show();
    await user.type(screen.getByLabelText('Título *'), 'Dev');
    await user.type(screen.getByLabelText('Cliente *'), 'Banco');
    await fillOpportunity(user);
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    return user;
  }

  it('should advance and create the opportunity with no candidates and with the panel never opened', async () => {
    vi.mocked(infra.fetchAvailableCandidates).mockResolvedValue(makePage([]));
    const user = await reachCandidatesStep();
    expect(await screen.findByRole('button', { name: 'Siguiente' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Crear oportunidad' }));
    expect(await screen.findByText('detalle')).toBeInTheDocument();
    expect(vi.mocked(infra.createProcess).mock.calls[0][0]).not.toHaveProperty('candidateIds');
  });

  it('should still advance without candidates after opening and closing the panel', async () => {
    const user = await reachCandidatesStep();
    await openPanel(user);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByRole('heading', { level: 2, name: 'Confirmar y crear' })).toBeInTheDocument();
    expect(screen.getByText('Aún sin candidatos')).toBeInTheDocument();
  });

  it('should create the opportunity without a candidate that was created and then deselected, and never delete it', async () => {
    const list = mockAvailableList(0);
    vi.mocked(candidatesInfra.createCandidate).mockImplementation(() => { list.markCreated(); return Promise.resolve(CREATED_CANDIDATE); });
    const user = await reachCandidatesStep();
    await openPanel(user);
    await startManual(user);
    await fillCandidate(user);
    await saveCandidate(user);
    await user.click(await screen.findByRole('checkbox', { name: CREATED_ROW_LABEL }));
    expect(screen.getByRole('checkbox', { name: CREATED_ROW_LABEL })).not.toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Crear oportunidad' }));
    expect(await screen.findByText('detalle')).toBeInTheDocument();
    expect(vi.mocked(infra.createProcess).mock.calls[0][0]).not.toHaveProperty('candidateIds');
  });

  it('should not call any candidate infra function other than create when discarding after creating a candidate', async () => {
    const list = mockAvailableList(0);
    vi.mocked(candidatesInfra.createCandidate).mockImplementation(() => { list.markCreated(); return Promise.resolve(CREATED_CANDIDATE); });
    const user = await reachCandidatesStep();
    await openPanel(user);
    await startManual(user);
    await fillCandidate(user);
    await saveCandidate(user);
    await screen.findByRole('checkbox', { name: CREATED_ROW_LABEL });
    await user.click(screen.getByRole('button', { name: 'Siguiente' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar y descartar' }));
    expect(candidatesInfra.createCandidate).toHaveBeenCalledTimes(1);
    expect(candidatesInfra.updateCandidate).not.toHaveBeenCalled();
    expect(Object.keys(candidatesInfra).sort()).toEqual(['createCandidate', 'extractCv', 'updateCandidate']);
  });
});
