import { act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import type { IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { useAuthStore } from '../../../auth/store/auth.store';
import * as infra from '../../infrastructure/processList.infra';
import { renderWithProviders } from '../../test-utils';
import { DashboardPage } from './DashboardPage';

vi.mock('../../infrastructure/processList.infra');

const fetchList = vi.mocked(infra.fetchProcessList);
const item = (n: number): IProcessListItem => ({
  id: `p${n}`, title: `Proceso ${n}`, clientName: 'ACME', ownerPmId: 'pm1', recruiterId: null, opportunityRole: '', skills: [], roleDescription: '', band: null, technicalRefIds: [],
  maxCandidates: 5, candidateCount: 1, status: 'open', createdBy: 'u1',
  createdAt: '2026-03-05T12:00:00.000Z', updatedAt: '2026-03-05T12:00:00.000Z',
});
const page = (limit: number): PaginatedResponse<IProcessListItem> => {
  const data = Array.from({ length: Math.min(limit, 7) }, (_, i) => item(i + 1));
  return { data, total: 7, page: 1, limit, totalPages: 1 };
};
const login = (role: 'recruiter' | 'pm' | 'technical_ref'): void => {
  useAuthStore.getState().setAuth({ id: 'u1', email: 'a@ibm.com', role, name: 'A' }, 'fake-session-value');
};

function setup(): void {
  renderWithProviders(
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/processes/new" element={<p>wizard</p>} />
    </Routes>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    fetchList.mockImplementation(params => Promise.resolve(page(params?.limit ?? 20)));
    login('recruiter');
  });
  afterEach(() => { act(() => useAuthStore.getState().clearAuth()); });

  it('should render the "Inicio" heading and a single primary action', () => {
    setup();
    expect(screen.getByRole('heading', { level: 1, name: 'Inicio' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('should navigate to the wizard from "Nuevo Proceso"', async () => {
    setup();
    await userEvent.click(screen.getByRole('button', { name: 'Nuevo Proceso' }));
    expect(screen.getByText('wizard')).toBeInTheDocument();
  });

  it.each(['recruiter', 'pm'] as const)('should compose real counter, sections and processes for %s', async role => {
    login(role);
    setup();
    expect(await screen.findByRole('link', { name: 'Procesos activos: 7' })).toHaveAttribute('href', '/processes');
    expect(await screen.findByRole('region', { name: 'Requiere atención' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Procesos activos' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Entrevistas de hoy' })).toBeInTheDocument();
    expect(await screen.findByText('Proceso 1')).toBeInTheDocument();
  });

  it('should hide the processes card and section for technical_ref and never call the API', async () => {
    login('technical_ref');
    setup();
    expect(await screen.findByRole('link', { name: /Feedback pendiente/ })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Requiere atención' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Entrevistas de hoy' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Procesos activos/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Procesos activos' })).not.toBeInTheDocument();
    expect(fetchList).not.toHaveBeenCalled();
  });

  it('should not show removed UX §3.2 elements', () => {
    setup();
    expect(screen.queryByText(/filtro global/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/meta/i)).not.toBeInTheDocument();
  });
});
