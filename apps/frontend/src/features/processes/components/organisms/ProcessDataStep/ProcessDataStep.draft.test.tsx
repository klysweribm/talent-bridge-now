import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { useAuthStore } from '@features/auth/store/auth.store';
import * as draftInfra from '../../../infrastructure/opportunityDraft.infra';
import { OpportunityDraftFailure } from '../../../infrastructure/opportunityDraft.errors';
import * as infra from '../../../infrastructure/processCreate.infra';
import { useWizardStore } from '../../../store/wizard.store';
import { makePage, mockProcessLimits, renderWithProviders } from '../../../test-utils';
import { ProcessDataStep } from './ProcessDataStep';

vi.mock('../../../infrastructure/processCreate.infra');
vi.mock('../../../infrastructure/opportunityDraft.infra');

const ITAU: IOpportunityDraftResponse = {
  draft: {
    title: 'Fullstack para ITAU', clientName: 'ITAU', opportunityRole: 'Fullstack', skills: ['React', 'NestJS'],
    roleDescription: 'Evaluar React y NestJS.', band: 8, startDate: '2026-12-01',
  },
  missingFields: [], warnings: [],
};
const TEXT = 'Necesitamos un fullstack para ITAU';
const BOX = 'Describe la oportunidad con tus palabras';

async function generate(text = TEXT): Promise<void> {
  await userEvent.type(await screen.findByLabelText(BOX), text);
  await userEvent.click(screen.getByRole('button', { name: 'Generar con IA' }));
}

describe('ProcessDataStep — borrador con IA', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProcessLimits();
    vi.mocked(infra.fetchUserOptions).mockResolvedValue(makePage([{ id: 'u1', fullName: 'Ana PM' }]));
    vi.mocked(draftInfra.generateOpportunityDraft).mockResolvedValue(ITAU);
    useWizardStore.getState().reset();
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.getState().setAuth({ id: 'me', email: 'me@ibm.com', role: 'pm', name: 'Yo' }, 'token');
  });
  afterEach(() => useAuthStore.getState().clearAuth());

  it('should fill the form from free text, mark fields as suggested and create nothing', async () => {
    renderWithProviders(<ProcessDataStep />);
    await generate();
    await waitFor(() => expect(screen.getByLabelText('Cliente *')).toHaveValue('ITAU'));
    expect(draftInfra.generateOpportunityDraft).toHaveBeenCalledWith(TEXT);
    expect(screen.getByLabelText('Título *')).toHaveValue('Fullstack para ITAU');
    expect(screen.getByLabelText('Rol de la oportunidad *')).toHaveValue('Fullstack');
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('NestJS')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Banda 8' })).toBeChecked();
    expect(screen.getByLabelText('Fecha de inicio')).toHaveValue('2026-12-01');
    expect(screen.getAllByText('Sugerido por ICA')).toHaveLength(7);
    expect(infra.createProcess).not.toHaveBeenCalled();
    expect(useWizardStore.getState().data.title).toBe('');
  });

  it('should flag fields the AI could not infer as to-complete and show backend warnings', async () => {
    vi.mocked(draftInfra.generateOpportunityDraft).mockResolvedValue({
      draft: { ...ITAU.draft, clientName: '', band: null }, missingFields: ['clientName', 'band'],
      warnings: ['Dice «senior» pero no hay banda: elígela a mano.'],
    });
    renderWithProviders(<ProcessDataStep />);
    await generate();
    await waitFor(() => expect(screen.getByLabelText('Título *')).toHaveValue('Fullstack para ITAU'));
    expect(screen.getByLabelText('Cliente *')).toHaveValue('');
    expect(screen.getAllByText('La IA no pudo inferirlo: complétalo').length).toBeGreaterThanOrEqual(2);
    const notice = screen.getByRole('status', { name: 'Avisos del borrador de IA' });
    expect(within(notice).getByText(/Por completar.*Cliente.*Banda/)).toBeInTheDocument();
    expect(within(notice).getByText('Dice «senior» pero no hay banda: elígela a mano.')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Banda 8' })).not.toBeChecked();
  });

  it('should never overwrite what the user typed and list it as not overwritten', async () => {
    renderWithProviders(<ProcessDataStep />);
    await userEvent.type(await screen.findByLabelText('Título *'), 'Mi título');
    await generate();
    await waitFor(() => expect(screen.getByLabelText('Cliente *')).toHaveValue('ITAU'));
    expect(screen.getByLabelText('Título *')).toHaveValue('Mi título');
    expect(within(screen.getByRole('status', { name: 'Avisos del borrador de IA' })).getByText(/No sobrescrito.*Título/)).toBeInTheDocument();
    expect(screen.getAllByText('Sugerido por ICA')).toHaveLength(6);
  });

  it('should drop the suggested mark of a field when the user edits it', async () => {
    renderWithProviders(<ProcessDataStep />);
    await generate();
    await waitFor(() => expect(screen.getByLabelText('Cliente *')).toHaveValue('ITAU'));
    await userEvent.type(screen.getByLabelText('Cliente *'), 'X');
    expect(screen.getAllByText('Sugerido por ICA')).toHaveLength(6);
  });

  it.each([
    ['AI_UNAVAILABLE', /no está disponible/],
    ['AI_TIMEOUT', /tardó demasiado/],
  ] as const)('should show a message for %s, keep the form usable and retry', async (code, message) => {
    vi.mocked(draftInfra.generateOpportunityDraft).mockRejectedValueOnce(new OpportunityDraftFailure(code));
    renderWithProviders(<ProcessDataStep />);
    await generate();
    expect(await within(await screen.findByRole('alert')).findByText(message)).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText('Título *'), 'manual');
    expect(screen.getByLabelText('Título *')).toHaveValue('manual');
    await userEvent.click(within(screen.getByRole('alert')).getByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByLabelText('Cliente *')).toHaveValue('ITAU'));
    expect(draftInfra.generateOpportunityDraft).toHaveBeenCalledTimes(2);
    expect(screen.queryByText(message)).not.toBeInTheDocument();
  });

  it('should show the server message verbatim when the text is too long', async () => {
    vi.mocked(draftInfra.generateOpportunityDraft).mockRejectedValueOnce(
      new OpportunityDraftFailure('OPPORTUNITY_TEXT_TOO_LONG', 'El texto supera el máximo de 4321 caracteres'),
    );
    renderWithProviders(<ProcessDataStep />);
    await generate();
    expect(await screen.findByText('El texto supera el máximo de 4321 caracteres')).toBeInTheDocument();
  });

  it('should disable generate for empty or whitespace text and show loading while pending', async () => {
    vi.mocked(draftInfra.generateOpportunityDraft).mockReturnValue(new Promise(() => undefined));
    renderWithProviders(<ProcessDataStep />);
    const button = await screen.findByRole('button', { name: 'Generar con IA' });
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText(BOX), '   ');
    expect(button).toBeDisabled();
    await userEvent.type(screen.getByLabelText(BOX), 'hola');
    await userEvent.click(button);
    const busy = await screen.findByRole('button', { name: 'Generando…' });
    expect(busy).toBeDisabled();
    expect(busy).toHaveAttribute('aria-busy', 'true');
  });

  it('should keep the text and the draft out of web storage and the wizard store until submit', async () => {
    renderWithProviders(<ProcessDataStep />);
    await generate();
    await waitFor(() => expect(screen.getByLabelText('Cliente *')).toHaveValue('ITAU'));
    const dump = JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage });
    expect(dump).not.toContain(TEXT);
    expect(dump).not.toContain('ITAU');
    expect(JSON.stringify(useWizardStore.getState())).not.toContain('ITAU');
    expect(JSON.stringify(useWizardStore.getState())).not.toContain(TEXT);
  });
});
