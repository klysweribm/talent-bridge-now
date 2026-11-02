import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NewCandidatePage } from './NewCandidatePage';
import { extractCv, createCandidate, updateCandidate } from '../../infrastructure/candidates.infra';
import { CvExtractionUnavailableError, CvInvalidFileError, DuplicateCandidateError, CandidateNotFoundError } from '../../infrastructure/candidates.errors';
import { EXTRACTOR_LABELS } from '../../config/candidates.constants';
import { makeCandidate, makeFile, makeResult, renderPage } from '../../test-utils';

vi.mock('../../infrastructure/candidates.infra', () => ({ extractCv: vi.fn(), createCandidate: vi.fn(), updateCandidate: vi.fn() }));

const extract = vi.mocked(extractCv);
const create = vi.mocked(createCandidate);
const update = vi.mocked(updateCandidate);
const actor = { id: 'u1', email: 'ana@ibm.com', role: 'recruiter' } as const;
const exactMatch = { id: 'ex1', fullName: 'Persona Inventada', email: 'persona@example.com', updatedAt: '2026-03-10T15:00:00.000Z', updateCount: 2, updatedBy: actor, reason: 'email' } as const;
const similarMatch = { id: 'sim1', fullName: 'Persona Inventada', email: 'otra@example.com', updatedAt: '2026-02-01T00:00:00.000Z', updateCount: 0, reason: 'name' } as const;

/** El nombre accesible incluye la ayuda del modo: se busca por el inicio. */
function modeRadio(label: string): HTMLElement {
  return screen.getByRole('radio', { name: new RegExp(`^${label.replace(/[()]/g, '\\$&')}`) });
}

async function upload(user: ReturnType<typeof userEvent.setup>, file = makeFile()): Promise<void> {
  await user.upload(screen.getByLabelText(/archivo del cv/i), file);
  await user.click(screen.getByRole('button', { name: /extraer perfil/i }));
}

describe('NewCandidatePage', () => {
  beforeEach(() => { extract.mockReset(); create.mockReset(); update.mockReset(); });

  it.each(['ica', 'ica-text', 'classic'] as const)('should paint the same editable form from a %s draft with its badge', async extractor => {
    extract.mockResolvedValue(makeResult(extractor));
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await user.click(modeRadio(EXTRACTOR_LABELS[extractor]));
    await upload(user);
    expect(await screen.findByLabelText(/nombre completo/i)).toHaveValue('Persona Inventada');
    expect(screen.getByLabelText(/correo/i)).toHaveValue('persona@example.com');
    expect(screen.getByLabelText(/skills/i)).toHaveValue('Java\nKafka');
    expect(screen.getByText(`Extraído con ${EXTRACTOR_LABELS[extractor]}`)).toBeInTheDocument();
    expect(extract).toHaveBeenCalledWith(expect.objectContaining({ mode: extractor }));
  });

  it('should keep a skill whose name contains commas as one skill when confirming', async () => {
    const COMMA_SKILL = 'AWS (EKS, Lambda, Bedrock, SQS, SNS)';
    extract.mockResolvedValue(makeResult('ica-text', { draft: { ...makeResult('ica-text').draft, skills: [{ name: COMMA_SKILL, level: 4, years: 6 }, { name: 'Kafka' }] } }));
    create.mockResolvedValue(makeCandidate());
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user);
    expect(await screen.findByLabelText(/skills/i)).toHaveValue(`${COMMA_SKILL}\nKafka`);
    await user.click(screen.getByRole('button', { name: /confirmar y crear candidato/i }));
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(create.mock.calls[0][0].skills).toEqual([{ name: COMMA_SKILL, level: 4, years: 6 }, { name: 'Kafka' }]);
  });

  it('should highlight missing fields with accessible text, not only color', async () => {
    extract.mockResolvedValue(makeResult('classic', { warnings: ['PDF sin texto'] }));
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user);
    const phone = await screen.findByLabelText(/teléfono/i);
    expect(phone).toHaveAccessibleDescription(/no se detectó en el cv/i);
    expect(screen.getByLabelText(/linkedin/i)).toHaveAccessibleDescription(/no se detectó/i);
    expect(screen.getByLabelText(/nombre completo/i)).not.toHaveAccessibleDescription(/no se detectó/i);
    expect(screen.getByText('PDF sin texto')).toBeInTheDocument();
  });

  it('should not create anything until confirming, and send the edited values on confirm', async () => {
    extract.mockResolvedValue(makeResult('ica', { draft: { ...makeResult('ica').draft, education: [{ institution: 'Universidad Ficticia', year: 2015 }], summary: 'Resumen inventado.' } }));
    create.mockResolvedValue(makeCandidate());
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user);
    const name = await screen.findByLabelText(/nombre completo/i);
    expect(create).not.toHaveBeenCalled();
    await user.clear(name);
    await user.type(name, 'Nombre Editado');
    await user.type(screen.getByLabelText(/teléfono/i), '+56 9 1111 1111');
    await user.click(screen.getByRole('button', { name: /confirmar y crear candidato/i }));
    await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
    expect(create.mock.calls[0][0]).toMatchObject({
      fullName: 'Nombre Editado', email: 'persona@example.com', phone: '+56 9 1111 1111',
      seniority: 'sr', yearsExperience: 8, location: { country: 'Chile', city: 'Santiago' },
      skills: [{ name: 'Java', level: 5, years: 8 }, { name: 'Kafka' }],
      languages: [{ code: 'es', level: 'native' }],
      experience: [{ company: 'Empresa Ficticia', role: 'Dev' }],
      education: [{ institution: 'Universidad Ficticia', year: 2015 }],
      summary: 'Resumen inventado.',
    });
    expect(await screen.findByText(/candidato creado/i)).toBeInTheDocument();
  });

  it('should block submit and show errors when fullName and email are empty (manual entry)', async () => {
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await user.click(screen.getByRole('button', { name: /escritura manual/i }));
    await user.click(screen.getByRole('button', { name: /confirmar y crear candidato/i }));
    expect(await screen.findByText(/el nombre es obligatorio/i)).toBeInTheDocument();
    expect(screen.getByText(/el correo es obligatorio/i)).toBeInTheDocument();
    expect(create).not.toHaveBeenCalled();
    expect(extract).not.toHaveBeenCalled();
  });

  it('should create from the manual form without extraction', async () => {
    create.mockResolvedValue(makeCandidate());
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await user.click(screen.getByRole('button', { name: /escritura manual/i }));
    await user.type(screen.getByLabelText(/nombre completo/i), 'Manual Inventada');
    await user.type(screen.getByLabelText(/correo/i), 'manual@example.com');
    await user.click(screen.getByRole('button', { name: /confirmar y crear candidato/i }));
    await waitFor(() => expect(create).toHaveBeenCalledWith(expect.objectContaining({ fullName: 'Manual Inventada', email: 'manual@example.com' })));
  });

  it('should reject a .doc, an empty file and an oversized file client-side without calling the extractor', async () => {
    const user = userEvent.setup({ applyAccept: false });
    renderPage(<NewCandidatePage />);
    await upload(user, makeFile('cv.doc', 'application/msword'));
    expect(await screen.findByRole('alert')).toHaveTextContent(/pdf o docx/i);
    await upload(user, makeFile('cv.pdf', 'application/pdf', ''));
    expect(screen.getByRole('alert')).toHaveTextContent(/vacío/i);
    await upload(user, makeFile('cv.pdf', 'application/pdf', 'x'.repeat(6 * 1024 * 1024)));
    expect(screen.getByRole('alert')).toHaveTextContent(/pesa 6,0 mb y el máximo es 5 mb/i);
    expect(extract).not.toHaveBeenCalled();
  });

  it('should show the backend message when the server rejects the file (400)', async () => {
    extract.mockRejectedValue(new CvInvalidFileError('El archivo está corrupto.'));
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user);
    expect(await screen.findByRole('alert')).toHaveTextContent(/corrupto/i);
  });

  it('should disable submit and announce progress while extracting', async () => {
    extract.mockReturnValue(new Promise(() => undefined));
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user);
    expect(await screen.findByRole('status')).toHaveTextContent(/hasta 90 segundos/i);
    expect(screen.getByRole('button', { name: /extraer perfil/i })).toBeDisabled();
  });

  it('should offer "Reintentar con Clásica" on 503 and re-run the SAME file only on click', async () => {
    extract.mockRejectedValueOnce(new CvExtractionUnavailableError('UNREACHABLE'));
    extract.mockResolvedValueOnce(makeResult('classic'));
    const file = makeFile();
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user, file);
    const retry = await screen.findByRole('button', { name: /reintentar con clásica/i });
    expect(extract).toHaveBeenCalledTimes(1);
    await user.click(retry);
    await waitFor(() => expect(extract).toHaveBeenCalledTimes(2));
    expect(extract.mock.calls[1][0]).toEqual({ file, mode: 'classic' });
    expect(await screen.findByText(/extraído con clásica/i)).toBeInTheDocument();
  });

  it('should show the existing candidate on a duplicate email and not report success', async () => {
    extract.mockResolvedValue(makeResult('ica'));
    create.mockRejectedValue(new DuplicateCandidateError(makeCandidate({ fullName: 'Existente Inventada' })));
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user);
    await user.click(await screen.findByRole('button', { name: /confirmar y crear candidato/i }));
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/ya existe un candidato/i)).toBeInTheDocument();
    expect(within(alert).getByText(/existente inventada/i)).toBeInTheDocument();
    expect(screen.queryByText(/candidato creado/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
  });

  it('should not persist the draft in web storage', async () => {
    extract.mockResolvedValue(makeResult('ica'));
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user);
    await screen.findByLabelText(/nombre completo/i);
    expect(JSON.stringify({ ...localStorage, ...sessionStorage })).not.toContain('persona@example.com');
  });

  it('should default to ICA (texto) and send that mode', async () => {
    extract.mockResolvedValue(makeResult('ica-text'));
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    expect(modeRadio(EXTRACTOR_LABELS['ica-text'])).toBeChecked();
    await upload(user);
    await screen.findByLabelText(/nombre completo/i);
    expect(extract).toHaveBeenCalledWith(expect.objectContaining({ mode: 'ica-text' }));
  });

  it('should show "Clásica completada con IA" only when classic carries completedWith', async () => {
    extract.mockResolvedValue(makeResult('classic', { completedWith: 'ica-text' }));
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user);
    expect(await screen.findByText(/extraído con clásica completada con ia/i)).toBeInTheDocument();
  });

  it('should offer the classic retry on a 503 from ica-text and never after a classic failure', async () => {
    extract.mockRejectedValueOnce(new CvExtractionUnavailableError('TIMEOUT'));
    const file = makeFile();
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user, file);
    expect(await screen.findByRole('button', { name: /reintentar con clásica/i })).toBeInTheDocument();
    extract.mockRejectedValueOnce(new Error('boom'));
    await user.click(modeRadio(EXTRACTOR_LABELS.classic));
    await user.click(screen.getByRole('button', { name: /extraer perfil/i }));
    await screen.findByRole('alert');
    expect(screen.queryByRole('button', { name: /reintentar con clásica/i })).not.toBeInTheDocument();
  });

  it('should show the additional read-only data below the form', async () => {
    extract.mockResolvedValue(makeResult('ica-text'));
    const user = userEvent.setup();
    renderPage(<NewCandidatePage />);
    await upload(user);
    expect(await screen.findByRole('heading', { name: /datos adicionales del candidato/i })).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Idiomas' })).toHaveTextContent(/español/i);
  });

  describe('matches (UC-CAND-6)', () => {
    it('should warn about the existing profile, update with PUT on exact.id and report who updated it', async () => {
      extract.mockResolvedValue(makeResult('ica-text', { matches: { exact: exactMatch, similar: [] } }));
      update.mockResolvedValue(makeCandidate({ id: 'ex1', updatedBy: actor, updateCount: 3 }));
      const user = userEvent.setup();
      renderPage(<NewCandidatePage />);
      await upload(user);
      expect(await screen.findByText('Este perfil ya existe y se va a actualizar al confirmar.')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /confirmar y crear candidato/i })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Actualizar candidato' }));
      await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
      expect(update.mock.calls[0][0]).toBe('ex1');
      expect(update.mock.calls[0][1]).toMatchObject({ fullName: 'Persona Inventada', email: 'persona@example.com' });
      expect(create).not.toHaveBeenCalled();
      expect(await screen.findByText(/candidato actualizado/i)).toBeInTheDocument();
      expect(screen.getByText('Actualizado por ana@ibm.com (Reclutador)')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cargar otro candidato' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Volver al nuevo proceso' })).toBeInTheDocument();
    });

    it('should lock the email to the stored one when updating, since the backend rejects a different email', async () => {
      extract.mockResolvedValue(makeResult('ica-text', {
        draft: { ...makeResult('ica-text').draft, email: 'otro-correo-del-cv@example.com' },
        matches: { exact: exactMatch, similar: [] },
      }));
      update.mockResolvedValue(makeCandidate({ id: 'ex1', updatedBy: actor, updateCount: 3 }));
      const user = userEvent.setup();
      renderPage(<NewCandidatePage />);
      await upload(user);

      const email = await screen.findByLabelText(/correo/i);
      expect(email).toHaveValue('persona@example.com');
      expect(email).toHaveAttribute('readonly');
      expect(email).toHaveAccessibleDescription(/no se puede cambiar/i);
      await user.click(screen.getByRole('button', { name: 'Actualizar candidato' }));
      await waitFor(() => expect(update).toHaveBeenCalledTimes(1));
      expect(update.mock.calls[0][1]).toMatchObject({ email: 'persona@example.com' });
    });

    it('should keep the email editable when creating a new candidate', async () => {
      extract.mockResolvedValue(makeResult('ica-text'));
      const user = userEvent.setup();
      renderPage(<NewCandidatePage />);
      await upload(user);

      expect(await screen.findByLabelText(/correo/i)).not.toHaveAttribute('readonly');
    });

    it('should show an error message when the update gets a 404', async () => {
      extract.mockResolvedValue(makeResult('ica-text', { matches: { exact: exactMatch, similar: [] } }));
      update.mockRejectedValue(new CandidateNotFoundError());
      const user = userEvent.setup();
      renderPage(<NewCandidatePage />);
      await upload(user);
      await user.click(await screen.findByRole('button', { name: 'Actualizar candidato' }));
      expect(await screen.findByRole('alert')).toHaveTextContent(/ya no existe/i);
      expect(screen.queryByText(/candidato actualizado/i)).not.toBeInTheDocument();
    });

    it('should show the similar notice, keep "Confirmar y crear candidato" and still create', async () => {
      extract.mockResolvedValue(makeResult('ica-text', { matches: { similar: [similarMatch] } }));
      create.mockResolvedValue(makeCandidate());
      const user = userEvent.setup();
      renderPage(<NewCandidatePage />);
      await upload(user);
      expect(await screen.findByText('Hay perfiles parecidos con otro correo')).toBeInTheDocument();
      expect(screen.getByText(/otra@example\.com · mismo nombre/)).toBeInTheDocument();
      expect(screen.queryByText(/se va a actualizar/i)).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Confirmar y crear candidato' }));
      await waitFor(() => expect(create).toHaveBeenCalledTimes(1));
      expect(update).not.toHaveBeenCalled();
      expect(await screen.findByText(/candidato creado/i)).toBeInTheDocument();
    });

    it('should switch to "Actualizar el existente" after a duplicate email, set its email and PUT', async () => {
      extract.mockResolvedValue(makeResult('ica'));
      create.mockRejectedValue(new DuplicateCandidateError(makeCandidate({ id: 'dup1', email: 'guardado@example.com' })));
      update.mockResolvedValue(makeCandidate({ id: 'dup1', email: 'guardado@example.com', updatedBy: actor, updateCount: 1 }));
      const user = userEvent.setup();
      renderPage(<NewCandidatePage />);
      await upload(user);
      await user.click(await screen.findByRole('button', { name: /confirmar y crear candidato/i }));
      await user.click(await screen.findByRole('button', { name: 'Actualizar el existente' }));
      expect(screen.getByLabelText(/correo/i)).toHaveValue('guardado@example.com');
      expect(screen.queryByRole('button', { name: /confirmar y crear candidato/i })).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Actualizar candidato' }));
      await waitFor(() => expect(update).toHaveBeenCalledWith('dup1', expect.objectContaining({ email: 'guardado@example.com' })));
      expect(await screen.findByText(/candidato actualizado/i)).toBeInTheDocument();
    });

    it('should keep the unchanged create flow when the result has no matches', async () => {
      extract.mockResolvedValue(makeResult('ica-text'));
      create.mockResolvedValue(makeCandidate());
      const user = userEvent.setup();
      renderPage(<NewCandidatePage />);
      await upload(user);
      await user.click(await screen.findByRole('button', { name: 'Confirmar y crear candidato' }));
      expect(await screen.findByText(/candidato creado/i)).toBeInTheDocument();
      expect(screen.queryByText(/perfiles parecidos/i)).not.toBeInTheDocument();
    });
  });
});
