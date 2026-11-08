import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import * as infra from '../../../infrastructure/processList.infra';
import { renderAt } from '../../../test-utils';
import { ProcessesPage } from './ProcessesPage';

vi.mock('../../../infrastructure/processList.infra');

const fetchList = vi.mocked(infra.fetchProcessList);
const search = (): string => screen.getByTestId('search').textContent ?? '';

const item = (over: Partial<IProcessListItem> = {}): IProcessListItem => ({
  id: 'p1', title: 'Backend Java Sr', clientName: 'Banco Andino', ownerPmId: 'pm1', recruiterId: null, opportunityRole: '', skills: [], roleDescription: '', band: null, startDate: null, technicalRefIds: [], technicalRefs: [],
  maxCandidates: 5, createdBy: 'u1', createdAt: '2026-03-05T12:00:00.000Z', updatedAt: '2026-03-05T12:00:00.000Z',
  candidateCount: 2, status: 'open', ...over,
});
const page = (data: IProcessListItem[], extra: Partial<PaginatedResponse<IProcessListItem>> = {}): PaginatedResponse<IProcessListItem> =>
  ({ data, total: data.length, page: 1, limit: 20, totalPages: 1, ...extra });
const detailStub = <p>detalle-stub</p>;

describe('ProcessesPage', () => {
  afterEach(() => { vi.useRealTimers(); });

  beforeEach(() => { vi.resetAllMocks(); fetchList.mockResolvedValue(page([item()])); });

  it('should show the loading state, then ProcessItem rows with "N candidatos"', async () => {
    renderAt(<ProcessesPage />, '/processes');
    expect(screen.getByRole('status', { name: /cargando oportunidades/i })).toBeInTheDocument();
    expect(await screen.findByText('Backend Java Sr')).toBeInTheDocument();
    expect(screen.getByText('Banco Andino')).toBeInTheDocument();
    expect(screen.getByText('2 candidatos')).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(fetchList).toHaveBeenCalledWith({});
  });

  it('should show the "+ Nueva oportunidad" link in the header pointing to /processes/new', async () => {
    renderAt(<ProcessesPage />, '/processes');
    expect(await screen.findByRole('link', { name: '+ Nueva oportunidad' })).toHaveAttribute('href', '/processes/new');
  });

  it('should show the empty state with a single "+ Nueva oportunidad" link (the header one)', async () => {
    fetchList.mockResolvedValue(page([], { totalPages: 0 }));
    renderAt(<ProcessesPage />, '/processes');
    expect(await screen.findByText('Sin oportunidades abiertas')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '+ Nueva oportunidad' })).toHaveLength(1);
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
    const link = await screen.findByRole('link', { name: 'Ver oportunidad de Backend Java Sr' });
    expect(link).toHaveAttribute('href', '/processes/p1');
    link.focus();
    await userEvent.keyboard('{Enter}');
    expect(await screen.findByText('detalle-stub')).toBeInTheDocument();
  });

  it('should show the total in the card header counter', async () => {
    fetchList.mockResolvedValue(page([item()], { total: 12 }));
    renderAt(<ProcessesPage />, '/processes');
    expect(await screen.findByLabelText('Total de oportunidades: 12')).toHaveTextContent('12');
    expect(screen.getByRole('region', { name: 'Oportunidades activas recientes' })).toBeInTheDocument();
  });

  it('should restore q from the URL into the box and the request', async () => {
    renderAt(<ProcessesPage />, '/processes?q=banco');
    expect(screen.getByRole('searchbox', { name: 'Filtrar por rol o cliente…' })).toHaveValue('banco');
    await waitFor(() => expect(fetchList).toHaveBeenCalledWith({ q: 'banco' }));
  });

  it('should debounce typing, then update the URL, reset to page 1 and query with q', async () => {
    renderAt(<ProcessesPage />, '/processes?page=3');
    await screen.findByText('Backend Java Sr');
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const box = screen.getByRole('searchbox');
    await user.type(box, ' java ');
    expect(search()).toBe('?page=3');
    await act(async () => { await vi.advanceTimersByTimeAsync(300); });
    expect(search()).toBe('?q=java');
    expect(box).toHaveFocus();
    vi.useRealTimers();
    await waitFor(() => expect(fetchList).toHaveBeenLastCalledWith({ q: 'java' }));
    expect(fetchList.mock.calls.filter(c => c[0]?.q).length).toBe(1);
  });

  it('should show "sin resultados" distinct from the empty state and clear the filter', async () => {
    fetchList.mockImplementation(p => Promise.resolve(p?.q ? page([], { totalPages: 0 }) : page([item()])));
    renderAt(<ProcessesPage />, '/processes?q=zzz');
    expect(await screen.findByText('Sin resultados para “zzz”')).toBeInTheDocument();
    expect(screen.queryByText('Sin oportunidades abiertas')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtro' }));
    expect(await screen.findByText('Backend Java Sr')).toBeInTheDocument();
    expect(search()).toBe('');
    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('should keep the search box and retry on error with a filter', async () => {
    fetchList.mockRejectedValueOnce(new Error('boom'));
    renderAt(<ProcessesPage />, '/processes?q=java');
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('searchbox')).toHaveValue('java');
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('Backend Java Sr')).toBeInTheDocument();
  });
});
