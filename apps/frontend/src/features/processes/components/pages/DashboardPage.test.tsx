import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '../../test-utils';
import { DashboardPage } from './DashboardPage';

function setup(): void {
  renderWithProviders(
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/processes/new" element={<p>wizard</p>} />
    </Routes>,
  );
}

describe('DashboardPage', () => {
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

  it('should compose counters, attention, active processes and today interviews', async () => {
    setup();
    expect(await screen.findByRole('link', { name: /Feedback pendiente/ })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Requiere atención' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Procesos activos' })).toBeInTheDocument();
    expect(await screen.findByRole('region', { name: 'Entrevistas de hoy' })).toBeInTheDocument();
  });

  it('should not show removed UX §3.2 elements', () => {
    setup();
    expect(screen.queryByText(/filtro global/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('searchbox')).not.toBeInTheDocument();
    expect(screen.queryByText(/meta/i)).not.toBeInTheDocument();
  });
});
