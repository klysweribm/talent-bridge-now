import { AiProviderError } from '../src/capabilities/ai/domain/errors/ai-provider.error';
import { OPPORTUNITY_DRAFT_MESSAGES } from '../src/capabilities/ai/domain/opportunity-draft/opportunity-draft.constants';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { API, authed, buildAiApp, closeAiApp, http, type IAiTestContext } from './support/ai-e2e.helpers';

/** `POST /ai/opportunity-draft` con el pipeline HTTP real. El proveedor de IA es SIEMPRE un puerto falso. */
jest.setTimeout(30_000);

const URL = `${API}/ai/opportunity-draft`;
const MAX = 200;
const ITAU_TEXT = 'Fullstack senior React y NestJS para ITAU, banda 8, inicio 2026-12-01';
const ITAU_JSON = {
  title: 'Fullstack para ITAU', clientName: 'ITAU', opportunityRole: 'Fullstack', skills: ['Reactjs', 'Nestjs'],
  roleDescription: 'Prueba técnica de React y NestJS', band: 8, startDate: '2026-12-01',
};
const completion = (value: unknown): { content: string; finishReason: string; model: string } => ({
  content: JSON.stringify(value), finishReason: 'stop', model: 'test-model',
});

describe('POST /ai/opportunity-draft', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('draft', fake.port); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => { fake.complete.mockReset().mockResolvedValue(completion(ITAU_JSON)); });

  describe('Escenario: Permisos', () => {
    it('should return 401 without a token', async () => {
      await http(ctx).post(URL).send({ text: ITAU_TEXT }).expect(401);
    });

    it('should return 403 for technical_ref and never reach the provider', async () => {
      await authed(ctx, http(ctx).post(URL).send({ text: ITAU_TEXT }), 'technical_ref').expect(403);
      expect(fake.complete).not.toHaveBeenCalled();
    });
  });

  describe('Escenario: Generar la oportunidad desde texto libre', () => {
    it.each(['pm', 'recruiter'] as const)('should return the sanitized draft for %s and create nothing (R1)', async (role) => {
      const res = await authed(ctx, http(ctx).post(URL).send({ text: ITAU_TEXT }), role).expect(200);

      expect(res.body).toEqual({
        draft: { ...ITAU_JSON, skills: ['React', 'NestJS'] },
        missingFields: [],
        warnings: [],
      });
    });

    it('should leave the client empty and report it when the text does not mention it', async () => {
      fake.complete.mockResolvedValue(completion({ ...ITAU_JSON, clientName: '', band: null }));

      const res = await authed(ctx, http(ctx).post(URL).send({ text: 'Fullstack senior' }), 'pm').expect(200);

      expect((res.body as { draft: { clientName: string; band: null } }).draft).toMatchObject({ clientName: '', band: null });
      expect((res.body as { missingFields: string[] }).missingFields).toEqual(expect.arrayContaining(['clientName', 'band']));
      expect((res.body as { warnings: string[] }).warnings.join(' ')).toMatch(/banda/i);
    });
  });

  describe('400: los tres mensajes se fijan por separado', () => {
    it('should answer an empty text with the DTO validation message', async () => {
      const res = await authed(ctx, http(ctx).post(URL).send({ text: '   ' }), 'pm').expect(400);

      expect((res.body as { message: string[] }).message).toContain(OPPORTUNITY_DRAFT_MESSAGES.textRequired);
      expect(fake.complete).not.toHaveBeenCalled();
    });

    it('should answer a text over the cap with OPPORTUNITY_TEXT_TOO_LONG and the cap from the config, without calling ICA', async () => {
      const res = await authed(ctx, http(ctx).post(URL).send({ text: 'x'.repeat(MAX + 1) }), 'pm').expect(400);

      expect(res.body).toEqual({ code: 'OPPORTUNITY_TEXT_TOO_LONG', message: `El texto supera el máximo de ${MAX} caracteres` });
      expect(fake.complete).not.toHaveBeenCalled();
    });

    it('should reject a body field the DTO does not define', async () => {
      await authed(ctx, http(ctx).post(URL).send({ text: ITAU_TEXT, band: 10 }), 'pm').expect(400);
    });
  });

  describe('Escenario: ICA no responde al generar (R6)', () => {
    it('should answer 503 AI_UNAVAILABLE with { code, message } when ICA is unreachable', async () => {
      fake.complete.mockRejectedValue(new AiProviderError('down', 'UNREACHABLE'));

      const res = await authed(ctx, http(ctx).post(URL).send({ text: ITAU_TEXT }), 'pm').expect(503);

      expect(res.body).toEqual({ code: 'AI_UNAVAILABLE', message: OPPORTUNITY_DRAFT_MESSAGES.unavailable });
    });

    it('should answer 504 AI_TIMEOUT with { code, message } when ICA times out', async () => {
      fake.complete.mockRejectedValue(new AiProviderError('slow', 'TIMEOUT'));

      const res = await authed(ctx, http(ctx).post(URL).send({ text: ITAU_TEXT }), 'pm').expect(504);

      expect(res.body).toEqual({ code: 'AI_TIMEOUT', message: OPPORTUNITY_DRAFT_MESSAGES.timeout });
    });

    it('should never echo the user text in an error body', async () => {
      fake.complete.mockRejectedValue(new AiProviderError(ITAU_TEXT, 'UNREACHABLE'));

      const res = await authed(ctx, http(ctx).post(URL).send({ text: ITAU_TEXT }), 'pm').expect(503);

      expect(JSON.stringify(res.body)).not.toContain('ITAU');
    });
  });
});

describe('POST /ai/opportunity-draft with the draft env vars missing', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('draft-off', fake.port, { OPPORTUNITY_DRAFT_MAX_TEXT_CHARS: '' }); });
  afterAll(() => closeAiApp(ctx));

  it('should fail closed with 503 AI_UNAVAILABLE instead of using a hidden default', async () => {
    const res = await authed(ctx, http(ctx).post(URL).send({ text: ITAU_TEXT }), 'pm').expect(503);

    expect((res.body as { code: string }).code).toBe('AI_UNAVAILABLE');
    expect(fake.complete).not.toHaveBeenCalled();
  });
});
