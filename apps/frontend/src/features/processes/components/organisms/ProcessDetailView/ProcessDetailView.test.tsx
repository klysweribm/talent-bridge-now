import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { useAuthStore, type AuthUser } from '@features/auth/store/auth.store';
import { HttpError } from '@shared/infrastructure/httpError';
import * as createInfra from '../../../infrastructure/processCreate.infra';
import * as listInfra from '../../../infrastructure/processList.infra';
import * as updateInfra from '../../../infrastructure/processUpdate.infra';
import { translateProcessActionError } from '../../../infrastructure/processUpdate.translate';
import { makeCandidate, makePage, renderWithProviders } from '../../../test-utils';
import { ProcessDetailView } from './ProcessDetailView';

vi.mock('../../../infrastructure/processList.infra');
vi.mock('../../../infrastructure/processCreate.infra');
vi.mock('../../../infrastructure/processUpdate.infra');

const fetchDetail = vi.mocked(listInfra.fetchProcessDetail);
const update = vi.mocked(updateInfra.updateProcess);
const add = vi.mocked(updateInfra.addProcessCandidate);
const remove = vi.mocked(updateInfra.removeProcessCandidate);
const available = vi.mocked(createInfra.fetchAvailableCandidates);

const DETAIL: IProcessDetail = {
  id: 'p1', title: 'Backend Java', clientName: 'Banco', ownerPmId: 'pm1', recruiterId: 'rec1', status: 'open',
  maxCandidates: 2, createdBy: 'pm1', createdAt: '2026-03-05T12:00:00.000Z', updatedAt: '2026-03-05T12:00:00.000Z',
  candidateIds: ['c1'], candidates: [{ id: 'c1', fullName: 'Lucía Fernández' }],
};
const login = (id: string, role: AuthUser['role']): void => useAuthStore.setState({ user: { id, role, email: `${id}@ibm.com`, name: id }, token: 't' });
const apiError = (status: number, code?: string): Error => translateProcessActionError(new HttpError(status, 'x', code ? { code } : null));
const mount = async (): Promise<ReturnType<typeof userEvent.setup>> => {
  renderWithProviders(<ProcessDetailView id="p1" />);
  await screen.findByRole('heading', { level: 1, name: 'Backend Java' });
  return userEvent.setup();
};

describe('ProcessDetailView actions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    login('pm1', 'pm');
    fetchDetail.mockResolvedValue(DETAIL);
    update.mockResolvedValue(DETAIL);
    add.mockResolvedValue(DETAIL);
    remove.mockResolvedValue(DETAIL);
    available.mockResolvedValue(makePage([makeCandidate(1), makeCandidate(2)]) as never);
    vi.mocked(createInfra.fetchUserOptions).mockResolvedValue(makePage([{ id: 'rec1', fullName: 'Rita' }, { id: 'rec2', fullName: 'Raúl' }]) as never);
  });
  afterEach(() => useAuthStore.getState().clearAuth());

  describe('permissions', () => {
    it('should show every action to the owner PM', async () => {
      await mount();
      expect(screen.getByRole('button', { name: 'Editar título y cliente' })).toBeInTheDocument();
      expect(screen.getByLabelText('Estado')).toBeInTheDocument();
      expect(await screen.findByLabelText('Reclutador')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Agregar candidato' })).toBeInTheDocument();
    });

    it('should hide the recruiter selector from the assigned recruiter but keep the rest', async () => {
      login('rec1', 'recruiter');
      await mount();
      expect(screen.queryByLabelText('Reclutador')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Estado')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Quitar a Lucía Fernández' })).toBeInTheDocument();
    });

    it.each([['pm2', 'pm'], ['rec9', 'recruiter'], ['tr1', 'technical_ref']] as const)('should be read-only for %s (%s)', async (id, role) => {
      login(id, role);
      await mount();
      expect(screen.queryByRole('button', { name: /editar|agregar|quitar|eliminar/i })).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument();
      expect(screen.getByText('Lucía Fernández')).toBeInTheDocument();
    });

    it.each(['closed', 'cancelled'] as const)('should offer no actions on a %s process', async status => {
      fetchDetail.mockResolvedValue({ ...DETAIL, status });
      await mount();
      expect(screen.queryByLabelText('Estado')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /editar|agregar|quitar|eliminar/i })).not.toBeInTheDocument();
      expect(screen.getByText(/solo lectura/i)).toBeInTheDocument();
    });
  });

  describe('edit title and client', () => {
    it('should PATCH the trimmed values and show success', async () => {
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Editar título y cliente' }));
      await user.clear(screen.getByLabelText('Título'));
      await user.type(screen.getByLabelText('Título'), '  Nuevo título ');
      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
      await waitFor(() => expect(update).toHaveBeenCalledWith('p1', { title: 'Nuevo título', clientName: 'Banco' }));
      expect(await screen.findByRole('status')).toHaveTextContent('Cambios guardados.');
    });

    it('should block an empty title with a field error and no request', async () => {
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Editar título y cliente' }));
      await user.clear(screen.getByLabelText('Título'));
      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
      expect(await screen.findByText('El título es obligatorio.')).toBeInTheDocument();
      expect(update).not.toHaveBeenCalled();
    });

    it.each([[403, undefined, /no tienes permiso/i], [400, 'PROCESS_TERMINAL_STATE', /cerrado o cancelado/i]])('should show the translated %i error', async (status, code, copy) => {
      update.mockRejectedValue(apiError(status, code));
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Editar título y cliente' }));
      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(copy);
    });

    it('should disable the buttons while saving', async () => {
      update.mockReturnValue(new Promise(() => undefined));
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Editar título y cliente' }));
      await user.click(screen.getByRole('button', { name: 'Guardar cambios' }));
      expect(await screen.findByRole('button', { name: 'Guardando…' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    });
  });

  describe('status', () => {
    it('should change between non-terminal states without confirmation', async () => {
      const user = await mount();
      await user.selectOptions(screen.getByLabelText('Estado'), 'interviewing');
      await waitFor(() => expect(update).toHaveBeenCalledWith('p1', { status: 'interviewing' }));
      expect(screen.queryByRole('group')).not.toBeInTheDocument();
      expect(await screen.findByRole('status')).toHaveTextContent('Estado actualizado.');
    });

    it('should ask for confirmation before closing and only then PATCH', async () => {
      const user = await mount();
      await user.selectOptions(screen.getByLabelText('Estado'), 'closed');
      const panel = screen.getByRole('group', { name: '¿Cerrar este proceso?' });
      expect(update).not.toHaveBeenCalled();
      await user.click(within(panel).getByRole('button', { name: 'Sí, cerrar proceso' }));
      await waitFor(() => expect(update).toHaveBeenCalledWith('p1', { status: 'closed' }));
    });

    it('should let the user back out of closing', async () => {
      const user = await mount();
      await user.selectOptions(screen.getByLabelText('Estado'), 'closed');
      await user.click(screen.getByRole('button', { name: 'Volver' }));
      expect(screen.queryByRole('group')).not.toBeInTheDocument();
      expect(update).not.toHaveBeenCalled();
    });

    it('should turn "Eliminar" into an inline cancel confirmation that warns candidates are freed', async () => {
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Eliminar proceso' }));
      const panel = screen.getByRole('group', { name: '¿Eliminar este proceso?' });
      expect(panel).toHaveTextContent(/candidatos quedarán libres/i);
      expect(panel).toHaveFocus();
      expect(update).not.toHaveBeenCalled();
      await user.click(within(panel).getByRole('button', { name: 'Sí, eliminar proceso' }));
      await waitFor(() => expect(update).toHaveBeenCalledWith('p1', { status: 'cancelled' }));
    });

    it.each([
      [503, 'PROCESS_RELEASE_FAILED', /no se pudieron liberar/i],
      [403, undefined, /no tienes permiso/i],
      [400, 'PROCESS_TERMINAL_STATE', /cerrado o cancelado/i],
    ])('should show the %i error when cancelling fails', async (status, code, copy) => {
      update.mockRejectedValue(apiError(status, code));
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Eliminar proceso' }));
      await user.click(screen.getByRole('button', { name: 'Sí, eliminar proceso' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(copy);
    });
  });

  describe('recruiter', () => {
    it('should PATCH the chosen recruiter', async () => {
      const user = await mount();
      await user.selectOptions(await screen.findByLabelText('Reclutador'), 'rec2');
      await waitFor(() => expect(update).toHaveBeenCalledWith('p1', { recruiterId: 'rec2' }));
    });

    it('should show the backend error when it answers 403', async () => {
      update.mockRejectedValue(apiError(403));
      const user = await mount();
      await user.selectOptions(await screen.findByLabelText('Reclutador'), 'rec2');
      expect(await screen.findByRole('alert')).toHaveTextContent(/no tienes permiso/i);
    });
  });

  describe('candidates', () => {
    it('should list only available candidates and add one, showing success', async () => {
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Agregar candidato' }));
      expect(await screen.findByText('1 de 2')).toBeInTheDocument();
      await user.click(await screen.findByRole('checkbox', { name: /Candidato 2/ }));
      await waitFor(() => expect(add).toHaveBeenCalledWith('p1', 'c2'));
      expect(await screen.findByText('Candidato agregado.')).toBeInTheDocument();
    });

    it('should lock the checkboxes and warn when the process is at its limit', async () => {
      fetchDetail.mockResolvedValue({ ...DETAIL, candidates: [...DETAIL.candidates, { id: 'c9', fullName: 'Otro' }], candidateIds: ['c1', 'c9'] });
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Agregar candidato' }));
      expect(await screen.findByText('Alcanzaste el máximo de 2 candidatos')).toBeInTheDocument();
      expect(await screen.findByRole('checkbox', { name: /Candidato 1/ })).toBeDisabled();
    });

    it.each([
      [409, 'CANDIDATE_ALREADY_ASSIGNED', /ya pertenecen a otro proceso/i],
      [400, 'PROCESS_CANDIDATE_LIMIT', /máximo de candidatos/i],
      [403, undefined, /no tienes permiso/i],
    ])('should show the %i error when adding fails', async (status, code, copy) => {
      add.mockRejectedValue(apiError(status, code));
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Agregar candidato' }));
      await user.click(await screen.findByRole('checkbox', { name: /Candidato 1/ }));
      expect(await screen.findByRole('alert')).toHaveTextContent(copy);
    });

    it('should remove a candidate from its row', async () => {
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Quitar a Lucía Fernández' }));
      await waitFor(() => expect(remove).toHaveBeenCalledWith('p1', 'c1'));
      expect(await screen.findByText('Candidato quitado.')).toBeInTheDocument();
    });

    it('should show the error when removing fails', async () => {
      remove.mockRejectedValue(apiError(503));
      const user = await mount();
      await user.click(screen.getByRole('button', { name: 'Quitar a Lucía Fernández' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(/no se modificó nada/i);
    });

    it('should not query available candidates until the box is opened', async () => {
      await mount();
      expect(available).not.toHaveBeenCalled();
    });
  });
});
