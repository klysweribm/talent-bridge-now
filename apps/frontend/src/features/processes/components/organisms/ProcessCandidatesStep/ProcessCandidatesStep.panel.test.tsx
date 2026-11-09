import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '@features/auth/store/auth.store';
import * as candidatesInfra from '@features/candidates/infrastructure/candidates.infra';
import * as infra from '../../../infrastructure/processCreate.infra';
import { useWizardStore } from '../../../store/wizard.store';
import { CREATED_CANDIDATE, CREATED_ROW_LABEL, deferred, fillCandidate, mockAvailableList, openPanel, saveCandidate, startManual } from '../../../panel-test-utils';
import { makeCandidate, mockProcessLimits, renderAt } from '../../../test-utils';
import { ProcessCandidatesStep } from './ProcessCandidatesStep';

vi.mock('../../../infrastructure/processCreate.infra');
vi.mock('@features/candidates/infrastructure/candidates.infra', () => ({ extractCv: vi.fn(), createCandidate: vi.fn(), updateCandidate: vi.fn() }));

function PathProbe(): JSX.Element {
  return <output data-testid="path">{useLocation().pathname}</output>;
}

function show(): void {
  renderAt(<><ProcessCandidatesStep /><PathProbe /></>, '/wizard?keep=1');
}

const NOTICE_OK = 'Candidato Persona Inventada creado en la base de candidatos y seleccionado para esta oportunidad.';

describe('ProcessCandidatesStep add-candidate panel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useWizardStore.getState().reset();
    useAuthStore.getState().setAuth({ id: 'me', email: 'm@ibm.com', role: 'pm', name: 'Yo' }, 't');
    mockProcessLimits({ maxCandidates: 5 });
    vi.mocked(candidatesInfra.createCandidate).mockResolvedValue(CREATED_CANDIDATE);
  });
  afterEach(() => useAuthStore.getState().clearAuth());

  it('should keep the wizard store and the URL untouched when opening and closing the panel', async () => {
    mockAvailableList();
    useWizardStore.setState({ step: 'candidates', data: { ...useWizardStore.getState().data, title: 'Dev' }, candidates: [makeCandidate(1)] });
    const before = useWizardStore.getState();
    const user = userEvent.setup();
    show();
    await openPanel(user);
    expect(screen.getByTestId('path')).toHaveTextContent('/wizard');
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(useWizardStore.getState().step).toBe(before.step);
    expect(useWizardStore.getState().data).toEqual(before.data);
    expect(useWizardStore.getState().candidates).toEqual(before.candidates);
    expect(screen.getByTestId('path')).toHaveTextContent('/wizard');
    expect(screen.getByTestId('search')).toHaveTextContent('?keep=1');
  });

  it.each(['pm', 'recruiter'] as const)('should list, preselect and count the new candidate when a %s creates it in the panel', async (role) => {
    useAuthStore.getState().setAuth({ id: 'me', email: 'm@ibm.com', role, name: 'Yo' }, 't');
    const list = mockAvailableList();
    vi.mocked(candidatesInfra.createCandidate).mockImplementation(() => { list.markCreated(); return Promise.resolve(CREATED_CANDIDATE); });
    const user = userEvent.setup();
    show();
    await screen.findByRole('checkbox', { name: 'Candidato 1 · Rol 1' });
    await openPanel(user);
    await startManual(user);
    await fillCandidate(user);
    await saveCandidate(user);
    expect(await screen.findByRole('checkbox', { name: CREATED_ROW_LABEL })).toBeChecked();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('1 de 5')).toBeInTheDocument();
    expect(screen.getByText(NOTICE_OK).closest('[role="status"]')).not.toBeNull();
    expect(useWizardStore.getState().candidates).toEqual([{ id: 'new1', fullName: 'Persona Inventada', primaryRole: 'Backend Developer' }]);
    expect(vi.mocked(infra.fetchAvailableCandidates).mock.calls.length).toBeGreaterThan(1);
  });

  it('should leave the new candidate unselected and warn when the limit is already full', async () => {
    const list = mockAvailableList(2);
    vi.mocked(candidatesInfra.createCandidate).mockImplementation(() => { list.markCreated(); return Promise.resolve(CREATED_CANDIDATE); });
    mockProcessLimits({ maxCandidates: 2 });
    useWizardStore.setState({ candidates: [makeCandidate(1), makeCandidate(2)] });
    const user = userEvent.setup();
    show();
    await openPanel(user);
    await startManual(user);
    await fillCandidate(user);
    await saveCandidate(user);
    expect(await screen.findByRole('checkbox', { name: CREATED_ROW_LABEL })).not.toBeChecked();
    expect(screen.getByText(/Candidato Persona Inventada creado\. No se seleccionó: ya tienes 2 de 2/)).toBeInTheDocument();
    expect(useWizardStore.getState().candidates.map(c => c.id)).toEqual(['c1', 'c2']);
  });

  it('should not select and ask the user to pick it when the limit never loaded', async () => {
    const list = mockAvailableList(1);
    vi.mocked(candidatesInfra.createCandidate).mockImplementation(() => { list.markCreated(); return Promise.resolve(CREATED_CANDIDATE); });
    vi.mocked(infra.fetchProcessLimits).mockRejectedValue(new Error('boom'));
    const user = userEvent.setup();
    show();
    await openPanel(user);
    await startManual(user);
    await fillCandidate(user);
    await saveCandidate(user);
    expect(await screen.findByRole('checkbox', { name: CREATED_ROW_LABEL })).not.toBeChecked();
    expect(screen.getByText('Candidato Persona Inventada creado en la base de candidatos. Selecciónalo de la lista si quieres agregarlo.')).toBeInTheDocument();
    expect(useWizardStore.getState().candidates).toEqual([]);
  });

  it('should keep the notice until Cerrar aviso is pressed', async () => {
    mockAvailableList();
    const user = userEvent.setup();
    show();
    await openPanel(user);
    await startManual(user);
    await fillCandidate(user);
    await saveCandidate(user);
    const notice = await screen.findByText(NOTICE_OK);
    vi.useFakeTimers({ shouldAdvanceTime: true });
    await vi.advanceTimersByTimeAsync(120_000);
    vi.useRealTimers();
    expect(notice).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(screen.queryByText(NOTICE_OK)).not.toBeInTheDocument();
  });

  it('should return focus to the Agregar candidato button when the panel closes', async () => {
    mockAvailableList();
    const user = userEvent.setup();
    show();
    await openPanel(user);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(screen.getByRole('button', { name: '+ Agregar candidato' })).toHaveFocus());
    await openPanel(user);
    await startManual(user);
    await fillCandidate(user);
    await saveCandidate(user);
    await screen.findByText(NOTICE_OK);
    await waitFor(() => expect(screen.getByRole('button', { name: '+ Agregar candidato' })).toHaveFocus());
  });

  it('should select the candidate only after the save resolves', async () => {
    mockAvailableList();
    const pending = deferred<typeof CREATED_CANDIDATE>();
    vi.mocked(candidatesInfra.createCandidate).mockReturnValue(pending.promise);
    const user = userEvent.setup();
    show();
    await openPanel(user);
    await startManual(user);
    await fillCandidate(user);
    await saveCandidate(user);
    expect(useWizardStore.getState().candidates).toEqual([]);
    pending.resolve(CREATED_CANDIDATE);
    expect(await screen.findByText(NOTICE_OK)).toBeInTheDocument();
    expect(useWizardStore.getState().candidates.map(c => c.id)).toEqual(['new1']);
  });
});
