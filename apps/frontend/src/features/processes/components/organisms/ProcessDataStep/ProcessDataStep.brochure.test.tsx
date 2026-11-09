import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { IOpportunityDraftResponse } from '@ibm-talent-bridge/shared-types';
import { useAuthStore } from '@features/auth/store/auth.store';
import * as draftInfra from '../../../infrastructure/opportunityDraft.infra';
import { OpportunityDraftFailure } from '../../../infrastructure/opportunityDraft.errors';
import * as infra from '../../../infrastructure/processCreate.infra';
import { OPPORTUNITY_SOURCE_MAX_FILE_BYTES } from '../../../config/opportunitySource.constants';
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
const BROCHURE = 'Archivo del brochure';
const pdf = (name = 'brochure.pdf'): File => new File(['contenido'], name, { type: 'application/pdf' });

async function upload(file: File): Promise<void> {
  await userEvent.upload(await screen.findByLabelText(BROCHURE), file, { applyAccept: false });
}

describe('ProcessDataStep — borrador desde un brochure', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockProcessLimits();
    vi.mocked(infra.fetchUserOptions).mockResolvedValue(makePage([{ id: 'u1', fullName: 'Ana PM' }]));
    vi.mocked(draftInfra.generateOpportunityDraftFromFile).mockResolvedValue(ITAU);
    useWizardStore.getState().reset();
    localStorage.clear();
    sessionStorage.clear();
    useAuthStore.getState().setAuth({ id: 'me', email: 'me@ibm.com', role: 'pm', name: 'Yo' }, 'token');
  });
  afterEach(() => useAuthStore.getState().clearAuth());

  it('should fill the form from a PDF brochure, mark fields as suggested and create nothing', async () => {
    renderWithProviders(<ProcessDataStep />);
    const file = pdf();
    await upload(file);
    await waitFor(() => expect(screen.getByLabelText('Cliente *')).toHaveValue('ITAU'));
    expect(draftInfra.generateOpportunityDraftFromFile).toHaveBeenCalledWith(file);
    expect(screen.getByLabelText('Título *')).toHaveValue('Fullstack para ITAU');
    expect(screen.getAllByText('Sugerido por ICA')).toHaveLength(7);
    expect(infra.createProcess).not.toHaveBeenCalled();
  });

  it('should not overwrite what the user typed and list it as not overwritten', async () => {
    renderWithProviders(<ProcessDataStep />);
    await userEvent.type(await screen.findByLabelText('Título *'), 'Mi título');
    await upload(pdf());
    await waitFor(() => expect(screen.getByLabelText('Cliente *')).toHaveValue('ITAU'));
    expect(screen.getByLabelText('Título *')).toHaveValue('Mi título');
    expect(within(screen.getByRole('status', { name: 'Avisos del borrador de IA' })).getByText(/No sobrescrito.*Título/)).toBeInTheDocument();
  });

  it('should not keep the file in web storage or the wizard store', async () => {
    renderWithProviders(<ProcessDataStep />);
    await upload(pdf('secreto-brochure.pdf'));
    await waitFor(() => expect(screen.getByLabelText('Cliente *')).toHaveValue('ITAU'));
    const dump = JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }) + JSON.stringify(useWizardStore.getState());
    expect(dump).not.toContain('secreto-brochure');
    expect(dump).not.toContain('contenido');
  });

  it('should show "No pudimos leer el documento", keep the form intact and offer no retry on an unreadable brochure', async () => {
    vi.mocked(draftInfra.generateOpportunityDraftFromFile).mockRejectedValue(new OpportunityDraftFailure('OPPORTUNITY_SOURCE_UNREADABLE'));
    renderWithProviders(<ProcessDataStep />);
    await userEvent.type(await screen.findByLabelText('Título *'), 'Mi título');
    await upload(pdf());
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/No pudimos leer el documento/);
    expect(within(alert).queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
    expect(screen.getByLabelText('Título *')).toHaveValue('Mi título');
    expect(screen.getByLabelText('Cliente *')).toHaveValue('');
    expect(screen.queryByText('Sugerido por ICA')).not.toBeInTheDocument();
  });

  it.each([
    ['AI_UNAVAILABLE', /no está disponible/],
    ['AI_TIMEOUT', /tardó demasiado/],
  ] as const)('should show a message for %s by code when the brochure fails, without retry', async (code, message) => {
    vi.mocked(draftInfra.generateOpportunityDraftFromFile).mockRejectedValue(new OpportunityDraftFailure(code));
    renderWithProviders(<ProcessDataStep />);
    await upload(pdf());
    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('should reject an unsupported type without calling the server', async () => {
    renderWithProviders(<ProcessDataStep />);
    await upload(new File(['x'], 'brochure.exe'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/formatos|tipo|PDF/i);
    expect(draftInfra.generateOpportunityDraftFromFile).not.toHaveBeenCalled();
  });

  it('should reject a file over the limit without calling the server', async () => {
    renderWithProviders(<ProcessDataStep />);
    await upload(new File([new Uint8Array(OPPORTUNITY_SOURCE_MAX_FILE_BYTES + 1)], 'grande.pdf'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/máximo es 5 MB/);
    expect(draftInfra.generateOpportunityDraftFromFile).not.toHaveBeenCalled();
  });

  it('should disable the dropzone while the brochure is being processed', async () => {
    vi.mocked(draftInfra.generateOpportunityDraftFromFile).mockReturnValue(new Promise(() => undefined));
    renderWithProviders(<ProcessDataStep />);
    await upload(pdf());
    await waitFor(() => expect(screen.getByLabelText(BROCHURE)).toBeDisabled());
  });

  it('should still retry the text after a text failure', async () => {
    vi.mocked(draftInfra.generateOpportunityDraft).mockRejectedValueOnce(new OpportunityDraftFailure('AI_TIMEOUT')).mockResolvedValue(ITAU);
    renderWithProviders(<ProcessDataStep />);
    await userEvent.type(await screen.findByLabelText('Describe la oportunidad con tus palabras'), 'hola');
    await userEvent.click(screen.getByRole('button', { name: 'Generar con IA' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Reintentar' }));
    await waitFor(() => expect(screen.getByLabelText('Cliente *')).toHaveValue('ITAU'));
  });
});
