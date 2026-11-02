import { act, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { useAuthStore } from '../../../../auth/store/auth.store';
import * as infra from '../../../infrastructure/processList.infra';
import { renderWithProviders } from '../../../test-utils';
import { ActiveProcessesList } from './ActiveProcessesList';

vi.mock('../../../infrastructure/processList.infra');

const fetchList = vi.mocked(infra.fetchProcessList);
const item = (n: number): IProcessListItem => ({
  id: `p${n}`, title: `Proceso ${n}`, clientName: 'ACME', ownerPmId: 'pm1', recruiterId: null, opportunityRole: '', skills: [], roleDescription: '', band: null, technicalRefIds: [],
  maxCandidates: 5, candidateCount: 1, status: 'open', createdBy: 'u1',
  createdAt: '2026-03-05T12:00:00.000Z', updatedAt: '2026-03-05T12:00:00.000Z',
});
const page = (count: number, total: number): PaginatedResponse<IProcessListItem> =>
  ({ data: Array.from({ length: count }, (_, i) => item(i + 1)), total, page: 1, limit: 5, totalPages: 1 });
const login = (role: 'recruiter' | 'pm' | 'technical_ref'): void => {
  useAuthStore.getState().setAuth({ id: 'u1', email: 'a@ibm.com', role, name: 'A' }, 'fake-session-value');
};

describe('ActiveProcessesList', () => {
  beforeEach(() => { vi.resetAllMocks(); login('recruiter'); });
  afterEach(() => { act(() => useAuthStore.getState().clearAuth()); });

  it('should show 5 real rows and a "Ver todos" link to /processes when total > 5', async () => {
    fetchList.mockResolvedValue(page(5, 8));
    renderWithProviders(<ActiveProcessesList />);
    const section = await screen.findByRole('region', { name: 'Procesos activos' });
    expect(await within(section).findAllByRole('listitem')).toHaveLength(5);
    expect(within(section).getByRole('link', { name: 'Ver todos' })).toHaveAttribute('href', '/processes');
    expect(fetchList).toHaveBeenCalledWith({ limit: 5 });
  });

  it('should hide "Ver todos" when everything fits', async () => {
    fetchList.mockResolvedValue(page(5, 5));
    renderWithProviders(<ActiveProcessesList />);
    expect(await screen.findAllByRole('listitem')).toHaveLength(5);
    expect(screen.queryByRole('link', { name: 'Ver todos' })).not.toBeInTheDocument();
  });

  it('should offer to create the first process when empty', async () => {
    fetchList.mockResolvedValue(page(0, 0));
    renderWithProviders(<ActiveProcessesList />);
    expect(await screen.findByText('Aún no hay procesos.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Crear el primero' })).toHaveAttribute('href', '/processes/new');
  });

  it('should show an accessible loading state', () => {
    fetchList.mockReturnValue(new Promise(() => undefined));
    renderWithProviders(<ActiveProcessesList />);
    expect(screen.getByRole('status', { name: 'Cargando procesos' })).toBeInTheDocument();
  });

  it('should show the error and retry', async () => {
    fetchList.mockRejectedValueOnce(new Error('boom')).mockResolvedValue(page(2, 2));
    renderWithProviders(<ActiveProcessesList />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findAllByRole('listitem')).toHaveLength(2);
  });

  it('should render nothing and skip the API for technical_ref', () => {
    login('technical_ref');
    renderWithProviders(<ActiveProcessesList />);
    expect(screen.queryByRole('region', { name: 'Procesos activos' })).not.toBeInTheDocument();
    expect(fetchList).not.toHaveBeenCalled();
  });
});
