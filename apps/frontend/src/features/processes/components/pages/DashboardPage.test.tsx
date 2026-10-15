import { render, screen, type RenderResult } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from './DashboardPage';
import { useAuthStore } from '@features/auth/store/auth.store';

const MOCK_USER = { id: '1', name: 'Mariana López', email: 'mariana@ibm.com', role: 'recruiter' as const };

function renderWithRouter(): RenderResult {
  return render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    useAuthStore.getState().setAuth(MOCK_USER, 'token');
  });

  afterEach(() => {
    useAuthStore.getState().clearAuth();
  });

  it('should render page heading', () => {
    renderWithRouter();
    expect(screen.getByRole('heading', { name: /dashboard de reclutamiento/i })).toBeInTheDocument();
  });

  it('should render welcome message with user name', () => {
    renderWithRouter();
    expect(screen.getByText('Mariana López')).toBeInTheDocument();
  });

  it('should render all 4 KPI cards', () => {
    renderWithRouter();
    expect(screen.getByLabelText('Procesos Activos: 12')).toBeInTheDocument();
    expect(screen.getByLabelText('Candidatos en Proceso: 34')).toBeInTheDocument();
    expect(screen.getByLabelText('Entrevistas Esta Semana: 8')).toBeInTheDocument();
    expect(screen.getByLabelText('Contratados Este Mes: 5')).toBeInTheDocument();
  });

  it('should render process list section', () => {
    renderWithRouter();
    expect(screen.getByLabelText('Procesos Activos Recientes')).toBeInTheDocument();
  });

  it('should render interviews section', () => {
    renderWithRouter();
    expect(screen.getByLabelText('Entrevistas del Día')).toBeInTheDocument();
  });

  it('should render progress bar for hired goal', () => {
    renderWithRouter();
    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '63');
  });

  it('should render Nuevo Proceso button', () => {
    renderWithRouter();
    expect(screen.getByLabelText('Nuevo Proceso de Selección')).toBeInTheDocument();
  });

  it('should render all mock processes', () => {
    renderWithRouter();
    expect(screen.getByText('Desarrollador React & Node.js Senior')).toBeInTheDocument();
    expect(screen.getByText('Arquitecto Cloud AWS / IBM Cloud')).toBeInTheDocument();
    expect(screen.getByText('Data Engineer — Pipeline & MLOps')).toBeInTheDocument();
  });
});
