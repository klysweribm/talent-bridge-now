import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import { useAuthStore } from '@features/auth/store/auth.store';
import * as candidatesInfra from '@features/candidates/infrastructure/candidates.infra';
import { makeFile, makeResult } from '@features/candidates/test-utils';
import { useWizardStore } from '../../../store/wizard.store';
import { deferred, fillCandidate, mockAvailableList, openPanel, saveCandidate, startManual } from '../../../panel-test-utils';
import { makeCandidate, mockProcessLimits, renderAt } from '../../../test-utils';
import { ProcessCandidatesStep } from './ProcessCandidatesStep';

vi.mock('../../../infrastructure/processCreate.infra');
vi.mock('@features/candidates/infrastructure/candidates.infra', () => ({ extractCv: vi.fn(), createCandidate: vi.fn(), updateCandidate: vi.fn() }));

async function setup(): Promise<ReturnType<typeof userEvent.setup>> {
  const user = userEvent.setup();
  renderAt(<ProcessCandidatesStep />, '/wizard');
  await openPanel(user);
  return user;
}

describe('ProcessCandidatesStep panel close rule', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useWizardStore.getState().reset();
    useAuthStore.getState().setAuth({ id: 'me', email: 'm@ibm.com', role: 'pm', name: 'Yo' }, 't');
    mockProcessLimits({ maxCandidates: 5 });
    mockAvailableList();
  });
  afterEach(() => useAuthStore.getState().clearAuth());

  it('should close directly when there is nothing to lose', async () => {
    const user = await setup();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should ask before discarding a dirty candidate and leave the wizard untouched when discarding', async () => {
    useWizardStore.setState({ step: 'candidates', candidates: [makeCandidate(1)] });
    const before = useWizardStore.getState();
    const user = await setup();
    await startManual(user);
    await fillCandidate(user);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    const confirm = screen.getByRole('alertdialog', { name: '¿Descartar este candidato?' });
    expect(confirm).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByRole('button', { name: 'Seguir editando' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(useWizardStore.getState().step).toBe(before.step);
    expect(useWizardStore.getState().data).toEqual(before.data);
    expect(useWizardStore.getState().candidates).toEqual(before.candidates);
    expect(candidatesInfra.createCandidate).not.toHaveBeenCalled();
  });

  it('should close only the confirmation when Escape is pressed inside it', async () => {
    const user = await setup();
    await startManual(user);
    await fillCandidate(user);
    await user.keyboard('{Escape}');
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Agregar candidato' })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toHaveValue('Persona Inventada');
  });

  it('should keep the panel open when choosing Seguir editando', async () => {
    const user = await setup();
    await startManual(user);
    await fillCandidate(user);
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    await user.click(screen.getByRole('button', { name: 'Seguir editando' }));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Agregar candidato' })).toBeInTheDocument();
  });

  it('should block Cerrar, Escape and outside click while the save is pending', async () => {
    vi.mocked(candidatesInfra.createCandidate).mockReturnValue(deferred<ICandidate>().promise);
    const user = await setup();
    await startManual(user);
    await fillCandidate(user);
    await saveCandidate(user);
    await screen.findByRole('button', { name: /crear candidato/i });
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    await user.keyboard('{Escape}');
    await user.click(screen.getByRole('dialog').parentElement as HTMLElement);
    expect(screen.getByRole('dialog', { name: 'Agregar candidato' })).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('should warn about the running extraction and ignore its result once discarded', async () => {
    const pending = deferred<ReturnType<typeof makeResult>>();
    vi.mocked(candidatesInfra.extractCv).mockReturnValue(pending.promise);
    const user = await setup();
    await user.upload(screen.getByLabelText(/archivo del cv/i), makeFile());
    await user.click(screen.getByRole('button', { name: /extraer perfil/i }));
    await user.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(screen.getByRole('alertdialog', { name: 'La extracción sigue en curso. ¿Cerrar y descartar?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Descartar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await act(async () => { pending.resolve(makeResult('classic')); await pending.promise; });
    expect(screen.queryByLabelText(/nombre completo/i)).not.toBeInTheDocument();
    expect(candidatesInfra.createCandidate).not.toHaveBeenCalled();
    expect(useWizardStore.getState().candidates).toEqual([]);
  });
});
