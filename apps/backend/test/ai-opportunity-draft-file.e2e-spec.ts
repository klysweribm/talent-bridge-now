import { OPPORTUNITY_DRAFT_MESSAGES } from '../src/capabilities/ai/domain/opportunity-draft/opportunity-draft.constants';
import { BROCHURE_TEXT, brochurePdf } from '../src/capabilities/ai/testing/brochure-fixtures';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { fakeXlsx } from '../src/capabilities/candidates/testing/cv-fixtures';
import type * as request from 'supertest';
import type { UserRole } from '@ibm-talent-bridge/shared-types';
import { API, authed, buildAiApp, closeAiApp, http, type IAiTestContext } from './support/ai-e2e.helpers';

/** `POST /ai/opportunity-draft/file` con el pipeline HTTP real (multipart, guards, extractor real). El proveedor de IA es SIEMPRE un puerto falso. */
jest.setTimeout(30_000);

const URL = `${API}/ai/opportunity-draft/file`;
const MAX_BYTES = 4096;
const ITAU_JSON = {
  title: 'Fullstack para ITAU', clientName: 'ITAU', opportunityRole: 'Fullstack', skills: ['Reactjs', 'Nestjs'],
  roleDescription: 'Prueba técnica de React y NestJS', band: 8, startDate: '2026-12-01',
};
const completion = (value: unknown): { content: string; finishReason: string; model: string } => ({ content: JSON.stringify(value), finishReason: 'stop', model: 'test-model' });

describe('POST /ai/opportunity-draft/file', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('draft-file', fake.port, { OPPORTUNITY_SOURCE_MAX_FILE_BYTES: String(MAX_BYTES), OPPORTUNITY_DRAFT_MAX_TEXT_CHARS: '500' }); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => { fake.complete.mockReset().mockResolvedValue(completion(ITAU_JSON)); });

  const send = (role: UserRole, file?: Buffer, name = 'brochure.pdf'): request.Test => {
    const call = http(ctx).post(URL);
    if (file) void call.attach('file', file, { filename: name });
    return authed(ctx, call, role);
  };

  describe('Escenario: Permisos', () => {
    it('should return 401 without a token', async () => {
      await http(ctx).post(URL).attach('file', brochurePdf(BROCHURE_TEXT), 'b.pdf').expect(401);
    });

    it('should return 403 for technical_ref and never reach the provider', async () => {
      await send('technical_ref', brochurePdf(BROCHURE_TEXT)).expect(403);
      expect(fake.complete).not.toHaveBeenCalled();
    });
  });

  describe('Escenario: Generar desde un brochure', () => {
    it.each(['pm', 'recruiter'] as const)('should return the same draft as free text for %s', async (role) => {
      const res = await send(role, brochurePdf(BROCHURE_TEXT)).expect(200);

      expect(res.body).toEqual({ draft: { ...ITAU_JSON, skills: ['React', 'NestJS'] }, missingFields: [], warnings: [] });
      expect(JSON.stringify(fake.complete.mock.calls[0][0])).toContain('ITAU');
    });

    it('should accept a Markdown brochure by its content, whatever its name', async () => {
      await send('pm', Buffer.from(`# ${BROCHURE_TEXT}`, 'utf8'), 'req.md').expect(200);
    });
  });

  describe('Escenario: Brochure ilegible', () => {
    it('should answer 422 OPPORTUNITY_SOURCE_UNREADABLE for a PDF without text, without calling ICA', async () => {
      const res = await send('pm', brochurePdf('')).expect(422);

      expect(res.body).toEqual({ code: 'OPPORTUNITY_SOURCE_UNREADABLE', message: OPPORTUNITY_DRAFT_MESSAGES.sourceUnreadable });
      expect(fake.complete).not.toHaveBeenCalled();
    });

    it('should answer 422 for a corrupt PDF (valid signature, garbage body)', async () => {
      const res = await send('pm', Buffer.from('%PDF-1.4 esto no es un pdf')).expect(422);

      expect((res.body as { code: string }).code).toBe('OPPORTUNITY_SOURCE_UNREADABLE');
    });
  });

  describe('400', () => {
    it('should reject an unsupported type (xlsx)', async () => {
      await send('pm', fakeXlsx(), 'x.pdf').expect(400);
      expect(fake.complete).not.toHaveBeenCalled();
    });

    it('should reject a missing file', async () => {
      await send('pm').expect(400);
    });

    it('should reject a file over the cap with 400, not 413', async () => {
      await send('pm', Buffer.alloc(MAX_BYTES + 10, 0x61), 'big.txt').expect(400);
      expect(fake.complete).not.toHaveBeenCalled();
    });

    it('should answer OPPORTUNITY_TEXT_TOO_LONG when the extracted text exceeds the cap', async () => {
      const res = await send('pm', Buffer.from('x'.repeat(501))).expect(400);

      expect(res.body).toEqual({ code: 'OPPORTUNITY_TEXT_TOO_LONG', message: 'El texto supera el máximo de 500 caracteres' });
    });
  });
});

describe('POST /ai/opportunity-draft/file with an invalid OPPORTUNITY_SOURCE_MAX_FILE_BYTES', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('draft-file-default', fake.port, { OPPORTUNITY_SOURCE_MAX_FILE_BYTES: 'grande' }); });
  afterAll(() => closeAiApp(ctx));

  // Antes (sin default) una env inválida dejaba el límite de multer en 2 bytes y el endpoint respondía 503. Ahora la config cae
  // al tope por defecto (5 MiB), así que un archivo real sigue la ruta normal.
  it('should fall back to the default cap and process a real file normally', async () => {
    fake.complete.mockReset().mockResolvedValue(completion(ITAU_JSON));

    const res = await authed(ctx, http(ctx).post(URL).attach('file', Buffer.from(BROCHURE_TEXT), 'b.txt'), 'pm').expect(200);

    expect((res.body as { draft: { clientName: string } }).draft.clientName).toBe('ITAU');
  });
});
