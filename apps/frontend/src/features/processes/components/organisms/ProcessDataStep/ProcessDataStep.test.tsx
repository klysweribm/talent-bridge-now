import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAuthStore } from '@features/auth/store/auth.store';
import * as infra from '../../../infrastructure/processCreate.infra';
import { useWizardStore } from '../../../store/wizard.store';
import { OPPORTUNITY_FIXTURE, fillOpportunity, makePage, renderWithProviders } from '../../../test-utils';
import { ProcessDataStep } from './ProcessDataStep';

vi.mock('../../../infrastructure/processCreate.infra');

const USERS = makePage([{ id: 'u1', fullName: 'Ana PM' }, { id: 'u2', fullName: 'Luis PM' }]);

function loginAs(role: 'recruiter' | 'pm'): void {
  useAuthStore.getState().setAuth({ id: 'me', email: 'me@ibm.com', role, name: 'Yo' }, 'token');
}

describe('ProcessDataStep', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(infra.fetchUserOptions).mockResolvedValue(USERS);
    useWizardStore.getState().reset();
  });
  afterEach(() => useAuthStore.getState().clearAuth());

  it('should show the required PM selector and no recruiter selector for a recruiter', async () => {
    loginAs('recruiter');
    renderWithProviders(<ProcessDataStep />);
    expect(await screen.findByLabelText('Project Manager *')).toBeInTheDocument();
    expect(screen.queryByLabelText('Reclutador')).not.toBeInTheDocument();
    expect(infra.fetchUserOptions).toHaveBeenCalledWith('pm', expect.anything());
  });

  it('should show the optional recruiter selector with Sin asignar and no PM selector for a PM', async () => {
    loginAs('pm');
    renderWithProviders(<ProcessDataStep />);
    const select = await screen.findByLabelText('Reclutador');
    expect(select).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Sin asignar' })).toBeInTheDocument();
    expect(screen.queryByLabelText('Project Manager *')).not.toBeInTheDocument();
  });

  it('should show the character counter hint', async () => {
    loginAs('pm');
    renderWithProviders(<ProcessDataStep />);
    await userEvent.type(screen.getByLabelText('Título *'), 'abc');
    expect(screen.getByText(/3\/200/)).toBeInTheDocument();
  });

  it('should show text errors, a banner and focus the first invalid field on empty submit', async () => {
    loginAs('recruiter');
    renderWithProviders(<ProcessDataStep />);
    await screen.findByLabelText('Project Manager *');
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('El título es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('El cliente es obligatorio.')).toBeInTheDocument();
    expect(screen.getByText('Elige el PM responsable del proceso.')).toBeInTheDocument();
    expect(screen.getByText('Hay 7 errores en el formulario.')).toBeInTheDocument();
    ['El rol de la oportunidad es obligatorio.', 'Agrega al menos 1 tecnología.', 'Elige la banda profesional.', 'La descripción del rol es obligatoria.']
      .forEach(message => expect(screen.getByText(message)).toBeInTheDocument());
    await waitFor(() => expect(screen.getByLabelText('Título *')).toHaveFocus());
    expect(screen.getByLabelText('Título *')).toHaveAttribute('aria-invalid', 'true');
    expect(useWizardStore.getState().step).toBe('data');
  });

  it('should validate on blur', async () => {
    loginAs('pm');
    renderWithProviders(<ProcessDataStep />);
    await userEvent.click(screen.getByLabelText('Título *'));
    await userEvent.tab();
    expect(await screen.findByText('El título es obligatorio.')).toBeInTheDocument();
  });

  it('should save into the store and go to candidates on valid submit', async () => {
    loginAs('recruiter');
    renderWithProviders(<ProcessDataStep />);
    await userEvent.type(screen.getByLabelText('Título *'), 'Dev Java');
    await userEvent.type(screen.getByLabelText('Cliente *'), 'Banco');
    await fillOpportunity(userEvent.setup());
    await userEvent.selectOptions(await screen.findByLabelText('Project Manager *'), 'u2');
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() => expect(useWizardStore.getState().step).toBe('candidates'));
    expect(useWizardStore.getState().data).toMatchObject({ title: 'Dev Java', clientName: 'Banco', ownerPmId: 'u2', ...OPPORTUNITY_FIXTURE, skills: ['Java', 'Spring'] });
  });

  it('should show an error with retry when users fail to load, keeping the form usable', async () => {
    loginAs('recruiter');
    vi.mocked(infra.fetchUserOptions).mockRejectedValueOnce(new Error('boom')).mockResolvedValue(USERS);
    renderWithProviders(<ProcessDataStep />);
    expect(await screen.findByText('No se pudo cargar la lista de usuarios.')).toBeInTheDocument();
    expect(screen.getByLabelText('Título *')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByLabelText('Project Manager *')).toBeInTheDocument();
  });

  it('should require every opportunity field and not advance when they are missing', async () => {
    loginAs('pm');
    renderWithProviders(<ProcessDataStep />);
    await userEvent.type(screen.getByLabelText('Título *'), 'Dev');
    await userEvent.type(screen.getByLabelText('Cliente *'), 'Banco');
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByText('Elige la banda profesional.')).toBeInTheDocument();
    expect(useWizardStore.getState().step).toBe('data');
  });

  it('should show the description character counter', async () => {
    loginAs('pm');
    renderWithProviders(<ProcessDataStep />);
    await userEvent.type(screen.getByLabelText('Expectativas de evaluación técnica *'), 'abcd');
    expect(screen.getByText(/4\/2000/)).toBeInTheDocument();
  });
});
