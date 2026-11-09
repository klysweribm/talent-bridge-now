import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as infra from '../../../infrastructure/processCreate.infra';
import { useWizardStore } from '../../../store/wizard.store';
import { makeCandidate, makePage, mockProcessLimits, renderWithProviders } from '../../../test-utils';
import { ProcessCandidatesStep } from './ProcessCandidatesStep';

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

  it.each([
    ['a list with candidates', () => undefined],
    ['an empty list', () => vi.mocked(infra.fetchAvailableCandidates).mockResolvedValue(makePage([]))],
    ['a full limit', () => mockProcessLimits({ maxCandidates: 1 })],
    ['a list that is still loading', () => vi.mocked(infra.fetchAvailableCandidates).mockReturnValue(new Promise(() => undefined))],
    ['a list that failed', () => vi.mocked(infra.fetchAvailableCandidates).mockRejectedValue(new Error('boom'))],
    ['a limit that is still loading', () => vi.mocked(infra.fetchProcessLimits).mockReturnValue(new Promise(() => undefined))],
    ['a limit that failed', () => vi.mocked(infra.fetchProcessLimits).mockRejectedValue(new Error('boom'))],
  ])('should always show an enabled Agregar candidato button when there is %s', async (_name, arrange) => {
    arrange();
    if (_name === 'a full limit') useWizardStore.setState({ candidates: [makeCandidate(1)] });
    renderWithProviders(<ProcessCandidatesStep />);
    const button = screen.getByRole('button', { name: '+ Agregar candidato' });
    expect(button).toBeEnabled();
    expect(screen.queryByRole('link', { name: '+ Agregar candidato' })).not.toBeInTheDocument();
    await screen.findByRole('button', { name: 'Siguiente' });
    expect(screen.getByRole('button', { name: '+ Agregar candidato' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBeEnabled();
  });

  it('should show the empty message with the help text and keep the add button when none are available', async () => {
    vi.mocked(infra.fetchAvailableCandidates).mockResolvedValue(makePage([]));
    renderWithProviders(<ProcessCandidatesStep />);
    expect(await screen.findByText('No hay candidatos disponibles. Puedes crear uno o continuar sin candidatos.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+ Agregar candidato' })).toBeInTheDocument();
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
