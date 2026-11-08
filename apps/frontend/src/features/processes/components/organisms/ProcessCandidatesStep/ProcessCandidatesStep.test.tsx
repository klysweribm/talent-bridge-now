import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import * as infra from '../../../infrastructure/processCreate.infra';
import { useWizardStore } from '../../../store/wizard.store';
import { makeCandidate, makePage, mockProcessLimits, renderWithProviders } from '../../../test-utils';
import { ProcessCandidatesStep } from './ProcessCandidatesStep';

function LocationStateProbe(): JSX.Element {
  const location = useLocation();
  return location.pathname === '/candidates/new' ? <output data-testid="nav-state">{JSON.stringify(location.state)}</output> : <></>;
}

vi.mock('../../../infrastructure/processCreate.infra');

describe('ProcessCandidatesStep', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    useWizardStore.getState().reset();
    mockProcessLimits({ maxCandidates: 2 });
    vi.mocked(infra.fetchAvailableCandidates).mockResolvedValue(makePage([makeCandidate(1), makeCandidate(2), makeCandidate(3)]));
  });

  it('should list candidates as checkboxes and show the N de MAX counter from the backend limit', async () => {
    renderWithProviders(<ProcessCandidatesStep />);
    expect(await screen.findByRole('checkbox', { name: 'Candidato 1 · Rol 1' })).toBeInTheDocument();
    expect(await screen.findByText('0 de 2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Candidato 1 · Rol 1' }));
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
  });

  it('should disable unchecked boxes and warn when the limit is reached', async () => {
    renderWithProviders(<ProcessCandidatesStep />);
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Candidato 1 · Rol 1' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Candidato 2 · Rol 2' }));
    expect(screen.getByText('Alcanzaste el máximo de 2 candidatos')).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Candidato 3 · Rol 3' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'Candidato 1 · Rol 1' })).toBeEnabled();
  });

  it('should always show the Agregar candidato link to /candidates/new', async () => {
    renderWithProviders(<ProcessCandidatesStep />);
    expect(await screen.findByRole('link', { name: '+ Agregar candidato' })).toHaveAttribute('href', '/candidates/new');
  });

  it('should tell /candidates/new that it comes from the new-process form', async () => {
    renderWithProviders(<><ProcessCandidatesStep /><LocationStateProbe /></>);
    await userEvent.click(await screen.findByRole('link', { name: '+ Agregar candidato' }));
    expect(await screen.findByTestId('nav-state')).toHaveTextContent('{"from":"new-process"}');
  });

  it('should show the empty message and keep the add link when none are available', async () => {
    vi.mocked(infra.fetchAvailableCandidates).mockResolvedValue(makePage([]));
    renderWithProviders(<ProcessCandidatesStep />);
    expect(await screen.findByText('No hay candidatos disponibles')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '+ Agregar candidato' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
  });

  it('should show a loading state first', () => {
    vi.mocked(infra.fetchAvailableCandidates).mockReturnValue(new Promise(() => undefined));
    renderWithProviders(<ProcessCandidatesStep />);
    expect(screen.getByRole('status', { name: 'Cargando candidatos' })).toBeInTheDocument();
  });

  it('should show an error with retry', async () => {
    vi.mocked(infra.fetchAvailableCandidates).mockRejectedValueOnce(new Error('boom')).mockResolvedValue(makePage([makeCandidate(1)]));
    renderWithProviders(<ProcessCandidatesStep />);
    expect(await screen.findByText('No se pudieron cargar los candidatos.')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByRole('checkbox', { name: 'Candidato 1 · Rol 1' })).toBeInTheDocument();
  });

  it('should keep selections made on another page counting and checked from the store', async () => {
    vi.mocked(infra.fetchAvailableCandidates).mockImplementation(({ page }) => Promise.resolve(
      page === 2 ? makePage([makeCandidate(3)], 2, 2) : makePage([makeCandidate(1), makeCandidate(2)], 1, 2)));
    renderWithProviders(<ProcessCandidatesStep />);
    await userEvent.click(await screen.findByRole('checkbox', { name: 'Candidato 1 · Rol 1' }));
    await userEvent.click(within(screen.getByRole('navigation', { name: 'Paginación' })).getByRole('button', { name: 'Siguiente' }));
    expect(await screen.findByRole('checkbox', { name: 'Candidato 3 · Rol 3' })).toBeEnabled();
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Candidato 3 · Rol 3' }));
    expect(screen.getByText('2 de 2')).toBeInTheDocument();
    expect(useWizardStore.getState().candidates.map(c => c.id)).toEqual(['c1', 'c3']);
  });

  it('should navigate with Atrás and Siguiente', async () => {
    renderWithProviders(<ProcessCandidatesStep />);
    await screen.findByRole('checkbox', { name: 'Candidato 1 · Rol 1' });
    await userEvent.click(screen.getByRole('button', { name: 'Atrás' }));
    expect(useWizardStore.getState().step).toBe('data');
    await userEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    await waitFor(() => expect(useWizardStore.getState().step).toBe('confirm'));
  });
});
