import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IProcessDetail, IProcessTechnicalRef } from '@ibm-talent-bridge/shared-types';
import { useAuthStore } from '@features/auth/store/auth.store';
import { HttpError } from '@shared/infrastructure/httpError';
import * as createInfra from '../../../infrastructure/processCreate.infra';
import * as updateInfra from '../../../infrastructure/processUpdate.infra';
import { translateProcessActionError } from '../../../infrastructure/processUpdate.translate';
import { makePage, mockProcessLimits, renderWithProviders } from '../../../test-utils';
import { ProcessTechnicalTeamPanel } from './ProcessTechnicalTeamPanel';

vi.mock('../../../infrastructure/processCreate.infra');
vi.mock('../../../infrastructure/processUpdate.infra');

const update = vi.mocked(updateInfra.updateProcess);
const options = vi.mocked(createInfra.fetchUserOptions);

const ref = (id: string, status: 'active' | 'inactive' = 'active'): IProcessTechnicalRef => ({
  id, fullName: `Ref ${id}`, email: `${id}@ibm.com`, role: 'technical_ref', band: 9, description: '', status,
});
const PROCESS = (refs: readonly IProcessTechnicalRef[] = []): IProcessDetail => ({
  id: 'p1', title: 'T', clientName: 'C', ownerPmId: 'pm1', recruiterId: 'rec1', status: 'open', opportunityRole: '', skills: [], roleDescription: '', band: null, startDate: null,
  technicalRefIds: refs.map(r => r.id), technicalRefs: refs, maxCandidates: 2, createdBy: 'pm1', createdAt: '', updatedAt: '', candidateIds: [], candidates: [],
});
const AVAILABLE = [{ id: 'a', fullName: 'Ana Ref', band: 8 }, { id: 'b', fullName: 'Beto Ref' }, { id: 'c', fullName: 'Cami Ref', band: 7 }];
const apiError = (status: number, code?: string): Error => translateProcessActionError(new HttpError(status, 'x', code ? { code } : null));

function mount(process: IProcessDetail, canEdit = true): ReturnType<typeof userEvent.setup> {
  renderWithProviders(<ProcessTechnicalTeamPanel process={process} canEdit={canEdit} />);
  return userEvent.setup();
}
const open = async (user: ReturnType<typeof userEvent.setup>): Promise<void> => { await user.click(screen.getByRole('button', { name: 'Gestionar equipo técnico' })); };

describe('ProcessTechnicalTeamPanel', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProcessLimits();
    useAuthStore.setState({ user: { id: 'pm1', role: 'pm', email: 'pm1@ibm.com', name: 'pm1' }, token: 't' });
    options.mockResolvedValue(makePage(AVAILABLE) as never);
    update.mockResolvedValue(PROCESS());
  });

  it('should hide the manage button without edit permission and never fetch referents', () => {
    mount(PROCESS([ref('x')]), false);
    expect(screen.queryByRole('button', { name: 'Gestionar equipo técnico' })).not.toBeInTheDocument();
    expect(screen.getByText('Ref x')).toBeInTheDocument();
    expect(options).not.toHaveBeenCalled();
  });

  it('should open the picker listing name and band of available referents', async () => {
    const user = mount(PROCESS());
    await open(user);
    expect(await screen.findByRole('checkbox', { name: 'Ana Ref · Band 8' })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Beto Ref' })).toBeInTheDocument();
    expect(options).toHaveBeenCalledWith('technical_ref', expect.anything());
    expect(screen.getByText('0 de 2 seleccionados')).toBeInTheDocument();
  });

  it('should lock unchecked boxes at 2 and show the notice', async () => {
    const user = mount(PROCESS());
    await open(user);
    await user.click(await screen.findByRole('checkbox', { name: 'Ana Ref · Band 8' }));
    await user.click(screen.getByRole('checkbox', { name: 'Beto Ref' }));
    expect(screen.getByRole('checkbox', { name: 'Cami Ref · Band 7' })).toBeDisabled();
    expect(screen.getByText('2 de 2 seleccionados')).toBeInTheDocument();
    expect(screen.getByText(/Alcanzaste el máximo de 2 referentes/)).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Beto Ref' }));
    expect(screen.getByRole('checkbox', { name: 'Cami Ref · Band 7' })).toBeEnabled();
  });

  it('should PATCH the exact technicalRefIds on save', async () => {
    const user = mount(PROCESS());
    await open(user);
    await user.click(await screen.findByRole('checkbox', { name: 'Ana Ref · Band 8' }));
    await user.click(screen.getByRole('checkbox', { name: 'Cami Ref · Band 7' }));
    await user.click(screen.getByRole('button', { name: 'Guardar equipo' }));
    await waitFor(() => expect(update).toHaveBeenCalledWith('p1', { technicalRefIds: ['a', 'c'] }));
    expect(await screen.findByText('Equipo técnico actualizado.')).toBeInTheDocument();
  });

  it('should not send anything when the set did not change', async () => {
    const user = mount(PROCESS([ref('a')]));
    await open(user);
    await screen.findByRole('checkbox', { name: 'Ref a · Band 9' });
    await user.click(screen.getByRole('button', { name: 'Guardar equipo' }));
    expect(update).not.toHaveBeenCalled();
  });

  it('should clear the team with []', async () => {
    const user = mount(PROCESS([ref('a')]));
    await open(user);
    await user.click(await screen.findByRole('checkbox', { name: 'Ref a · Band 9' }));
    await user.click(screen.getByRole('button', { name: 'Guardar equipo' }));
    await waitFor(() => expect(update).toHaveBeenCalledWith('p1', { technicalRefIds: [] }));
  });

  it('should keep an inactive assigned referent visible and checked so it can be removed', async () => {
    const user = mount(PROCESS([ref('z', 'inactive')]));
    await open(user);
    const box = await screen.findByRole('checkbox', { name: 'Ref z · Band 9 · (inactivo)' });
    expect(box).toBeChecked();
    await user.click(box);
    await user.click(screen.getByRole('button', { name: 'Guardar equipo' }));
    await waitFor(() => expect(update).toHaveBeenCalledWith('p1', { technicalRefIds: [] }));
  });

  it('should discard the draft on cancel', async () => {
    const user = mount(PROCESS());
    await open(user);
    await user.click(await screen.findByRole('checkbox', { name: 'Beto Ref' }));
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    await open(user);
    expect(await screen.findByRole('checkbox', { name: 'Beto Ref' })).not.toBeChecked();
  });

  it.each([
    [apiError(400, 'PROCESS_INVALID_TECHNICAL_REF'), /ya no está disponible/],
    [apiError(400, 'PROCESS_TERMINAL_STATE'), /cerrada o cancelada/],
    [apiError(403), /No tienes permiso/],
    [apiError(503), /No se modificó nada/],
  ])('should show %s as an alert and keep the picker open', async (error, text) => {
    update.mockRejectedValue(error);
    const user = mount(PROCESS());
    await open(user);
    await user.click(await screen.findByRole('checkbox', { name: 'Beto Ref' }));
    await user.click(screen.getByRole('button', { name: 'Guardar equipo' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(text);
    expect(screen.getByRole('button', { name: 'Guardar equipo' })).toBeEnabled();
  });

  it('should disable controls while saving', async () => {
    update.mockReturnValue(new Promise(() => undefined));
    const user = mount(PROCESS());
    await open(user);
    await user.click(await screen.findByRole('checkbox', { name: 'Beto Ref' }));
    await user.click(screen.getByRole('button', { name: 'Guardar equipo' }));
    expect(await screen.findByRole('button', { name: 'Guardando…' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Beto Ref' })).toBeDisabled();
  });

  it('should show the empty state when no referents are available', async () => {
    options.mockResolvedValue(makePage([]) as never);
    const user = mount(PROCESS());
    await open(user);
    expect(await screen.findByText('No hay referentes técnicos disponibles.')).toBeInTheDocument();
  });

  it('should show a load error with retry', async () => {
    options.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(makePage(AVAILABLE) as never);
    const user = mount(PROCESS());
    await open(user);
    expect(await screen.findByText('No se pudieron cargar los referentes técnicos.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('checkbox', { name: 'Beto Ref' })).toBeInTheDocument();
  });

  it('should follow the server cap for referents (technicalRefsMax 1)', async () => {
    mockProcessLimits({ technicalRefsMax: 1 });
    const user = mount(PROCESS());
    await open(user);
    await user.click(await screen.findByRole('checkbox', { name: 'Ana Ref · Band 8' }));
    expect(screen.getByText('1 de 1 seleccionados')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Beto Ref' })).toBeDisabled();
  });

  it('should not open the picker nor assume a cap while the limits are unknown', async () => {
    vi.mocked(createInfra.fetchProcessLimits).mockReturnValue(new Promise(() => undefined));
    const user = mount(PROCESS());
    await open(user);
    expect(screen.queryByText(/seleccionados/)).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });
});
