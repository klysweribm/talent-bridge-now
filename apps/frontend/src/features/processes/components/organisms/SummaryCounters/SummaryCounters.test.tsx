import { act, screen } from '@testing-library/react';
import type { IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { useAuthStore } from '../../../../auth/store/auth.store';
import * as infra from '../../../infrastructure/processList.infra';
import { renderWithProviders } from '../../../test-utils';
import { SummaryCounters } from './SummaryCounters';

vi.mock('../../../infrastructure/processList.infra');

const fetchList = vi.mocked(infra.fetchProcessList);
const totalPage = (total: number): PaginatedResponse<IProcessListItem> => ({ data: [], total, page: 1, limit: 1, totalPages: total });
const login = (role: 'recruiter' | 'pm' | 'technical_ref'): void => {
  useAuthStore.getState().setAuth({ id: 'u1', email: 'a@ibm.com', role, name: 'A' }, 'fake-session-value');
};

describe('SummaryCounters', () => {
  beforeEach(() => { vi.resetAllMocks(); login('recruiter'); });
  afterEach(() => { act(() => useAuthStore.getState().clearAuth()); });

  it('should show the real total of processes and link to /processes without filters', async () => {
    fetchList.mockResolvedValue(totalPage(12));
    renderWithProviders(<SummaryCounters />);
    expect(await screen.findByRole('link', { name: 'Oportunidades activas: 12' })).toHaveAttribute('href', '/processes');
    expect(fetchList).toHaveBeenCalledWith({ limit: 1 });
    expect(screen.getByRole('link', { name: 'Entrevistas hoy: —' })).toHaveAttribute('href', '/interviews?date=today');
    expect(screen.getByRole('link', { name: 'Feedback pendiente: —' })).toHaveAttribute('href', '/feedback?status=pending');
    expect(screen.getAllByText('Próximamente')).toHaveLength(2);
    expect(screen.getAllByRole('link')).toHaveLength(3);
  });

  it('should not show a fake 0 while the total is loading', () => {
    fetchList.mockReturnValue(new Promise(() => undefined));
    renderWithProviders(<SummaryCounters />);
    expect(screen.getByRole('link', { name: /Entrevistas hoy/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Oportunidades activas: 0' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Oportunidades activas: …' })).toBeInTheDocument();
  });

  it('should show "—" on error without breaking the other counters', async () => {
    fetchList.mockRejectedValue(new Error('boom'));
    renderWithProviders(<SummaryCounters />);
    expect(await screen.findByRole('link', { name: 'Oportunidades activas: —' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Entrevistas hoy: —' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Feedback pendiente: —' })).toBeInTheDocument();
  });

  it('should hide the processes card and skip the API for technical_ref', () => {
    login('technical_ref');
    renderWithProviders(<SummaryCounters />);
    expect(screen.getByRole('link', { name: /Entrevistas hoy/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Oportunidades activas/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(2);
    expect(fetchList).not.toHaveBeenCalled();
  });
});
