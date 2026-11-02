import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import * as infra from '../../../infrastructure/processList.infra';
import { renderAt } from '../../../test-utils';
import { ProcessesPage } from './ProcessesPage';

vi.mock('../../../infrastructure/processList.infra');

const fetchList = vi.mocked(infra.fetchProcessList);
const search = (): string => screen.getByTestId('search').textContent ?? '';

const item = (over: Partial<IProcessListItem> = {}): IProcessListItem => ({
  id: 'p1', title: 'Backend Java Sr', clientName: 'Banco Andino', ownerPmId: 'pm1', recruiterId: null, opportunityRole: '', skills: [], roleDescription: '', band: null, technicalRefIds: [],
  maxCandidates: 5, createdBy: 'u1', createdAt: '2026-03-05T12:00:00.000Z', updatedAt: '2026-03-05T12:00:00.000Z',
  candidateCount: 2, status: 'open', ...over,
});
const page = (data: IProcessListItem[], extra: Partial<PaginatedResponse<IProcessListItem>> = {}): PaginatedResponse<IProcessListItem> =>
  ({ data, total: data.length, page: 1, limit: 20, totalPages: 1, ...extra });
const detailStub = <p>detalle-stub</p>;

describe('ProcessesPage', () => {
  beforeEach(() => { vi.resetAllMocks(); fetchList.mockResolvedValue(page([item()])); });

  it('should show the loading state, then ProcessItem rows with "N de MAX candidatos"', async () => {
    renderAt(<ProcessesPage />, '/processes');
    expect(screen.getByRole('status', { name: /cargando procesos/i })).toBeInTheDocument();
    expect(await screen.findByText('Backend Java Sr')).toBeInTheDocument();
    expect(screen.getByText('Banco Andino · 2 de 5 candidatos')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(fetchList).toHaveBeenCalledWith({});
  });

  it('should show the "+ Nuevo proceso" link in the header pointing to /processes/new', async () => {
    renderAt(<ProcessesPage />, '/processes');
    expect(await screen.findByRole('link', { name: '+ Nuevo proceso' })).toHaveAttribute('href', '/processes/new');
  });

  it('should show the empty state with a single "+ Nuevo proceso" link (the header one)', async () => {
    fetchList.mockResolvedValue(page([], { totalPages: 0 }));
    renderAt(<ProcessesPage />, '/processes');
    expect(await screen.findByText('Sin procesos abiertos')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '+ Nuevo proceso' })).toHaveLength(1);
  });

  it('should show the error state and retry', async () => {
    fetchList.mockRejectedValueOnce(new Error('boom'));
    renderAt(<ProcessesPage />, '/processes');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Backend Java Sr')).toBeInTheDocument();
  });

  it('should change page in the URL and query the infra with it', async () => {
    fetchList.mockResolvedValue(page([item()], { totalPages: 3 }));
    renderAt(<ProcessesPage />, '/processes');
    await userEvent.click(await screen.findByRole('button', { name: 'Siguiente' }));
    expect(search()).toBe('?page=2');
    await waitFor(() => expect(fetchList).toHaveBeenLastCalledWith({ page: 2 }));
  });

  it('should restore page and limit from the URL and discard invalid ones', async () => {
    renderAt(<ProcessesPage />, '/processes?page=3&limit=10');
    await screen.findByText('Backend Java Sr');
    expect(fetchList).toHaveBeenCalledWith({ page: 3, limit: 10 });
    fetchList.mockClear();
    renderAt(<ProcessesPage />, '/processes?page=-1&limit=999');
    await waitFor(() => expect(fetchList).toHaveBeenCalledWith({}));
  });

  it('should navigate to the detail when the row link is clicked or activated by keyboard', async () => {
    renderAt(<ProcessesPage />, '/processes', { path: '/processes/:id', element: detailStub });
    const link = await screen.findByRole('link', { name: 'Ver detalle de Backend Java Sr' });
    expect(link).toHaveAttribute('href', '/processes/p1');
    link.focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByText('detalle-stub')).toBeInTheDocument();
  });
});
