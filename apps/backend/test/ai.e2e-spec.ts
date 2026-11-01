import type { UserRole } from '@ibm-talent-bridge/shared-types';
import { AiProviderError } from '../src/capabilities/ai/domain/errors/ai-provider.error';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import {
  API, FAKE_KEY, authed, buildAiApp, closeAiApp, http, type IAiTestContext,
} from './support/ai-e2e.helpers';

/**
 * Integración AI-1: pipeline HTTP real (guards, ValidationPipe) + AiModule/AuthModule/BenchModule
 * contra Mongo real. El proveedor de IA es SIEMPRE un puerto falso: ningún test llama a ICA.
 */
jest.setTimeout(30_000);

const COMPLETION = {
  content: 'Hola, soy el asistente.',
  finishReason: 'stop',
  model: 'test-model',
  usage: { promptTokens: 5, completionTokens: 7 },
} as const;
const ASK = `${API}/ai/ask`;
const STATUS = `${API}/ai/status`;
const validBody = { topic: 'general', query: 'Hola' };

describe('AI endpoints with a working provider', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('ok', fake.port); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => {
    fake.complete.mockReset().mockResolvedValue(COMPLETION);
    fake.listModels.mockReset().mockResolvedValue(['test-model']);
  });

  it('should return 401 when no token is sent', async () => {
    await http(ctx).post(ASK).send(validBody).expect(401);
    await http(ctx).get(STATUS).expect(401);
  });

  it('should return 403 when the role is technical_ref', async () => {
    await authed(ctx, http(ctx).post(ASK).send(validBody), 'technical_ref').expect(403);
    await authed(ctx, http(ctx).get(STATUS), 'technical_ref').expect(403);
  });

  it.each([
    ['topic outside the list', { topic: 'cv', query: 'Hola' }],
    ['empty query', { topic: 'general', query: '' }],
    ['blank query', { topic: 'general', query: '   ' }],
    ['query too long', { topic: 'general', query: 'x'.repeat(4001) }],
    ['missing topic', { query: 'Hola' }],
    ['unexpected field', { ...validBody, context: 'inyectado' }],
  ])('should return 400 when the body has %s', async (_name, body) => {
    await authed(ctx, http(ctx).post(ASK).send(body), 'recruiter').expect(400);
    expect(fake.complete).not.toHaveBeenCalled();
  });

});

describe('AI endpoints answers and status', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('answers', fake.port); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => {
    fake.complete.mockReset().mockResolvedValue(COMPLETION);
    fake.listModels.mockReset().mockResolvedValue(['test-model']);
  });

  it.each<UserRole>(['recruiter', 'pm'])('should return 200 with the answer when the role is %s', async (role) => {
    const response = await authed(ctx, http(ctx).post(ASK).send(validBody), role).expect(200);

    expect(response.body).toEqual({
      ok: true, answer: COMPLETION.content, topic: 'general', source: 'ica', model: 'test-model', usage: COMPLETION.usage,
    });
  });

  it('should report available status without leaking the key', async () => {
    const response = await authed(ctx, http(ctx).get(STATUS), 'pm').expect(200);

    expect(response.body).toEqual({ available: true, source: 'ica', model: 'test-model' });
    expect(JSON.stringify(response.body)).not.toContain(FAKE_KEY);
  });

  it('should report MODEL_NOT_FOUND when the configured model is not listed', async () => {
    fake.listModels.mockResolvedValue(['otro-modelo']);

    const response = await authed(ctx, http(ctx).get(STATUS), 'pm').expect(200);

    expect(response.body).toMatchObject({ available: false, reason: 'MODEL_NOT_FOUND' });
  });
});

describe('AI unavailable', () => {
  it('should return 503 with the reason (never 401) when the provider fails', async () => {
    const fake = fakeAiPort();
    fake.complete.mockRejectedValue(new AiProviderError('boom', 'UNAUTHORIZED', 400));
    const ctx = await buildAiApp('fail', fake.port);

    const response = await authed(ctx, http(ctx).post(ASK).send(validBody), 'recruiter').expect(503);

    expect(response.body).toEqual({ ok: false, reason: 'UNAUTHORIZED' });
    await closeAiApp(ctx);
  });

  it('should return 503 NOT_CONFIGURED and a clean status when there is no key', async () => {
    const fake = fakeAiPort();
    const ctx = await buildAiApp('nokey', fake.port, { ICA_API_KEY: '' });

    const ask = await authed(ctx, http(ctx).post(ASK).send(validBody), 'recruiter').expect(503);
    const status = await authed(ctx, http(ctx).get(STATUS), 'recruiter').expect(200);

    expect(ask.body).toEqual({ ok: false, reason: 'NOT_CONFIGURED' });
    expect(status.body).toEqual({ available: false, source: null, model: null, reason: 'NOT_CONFIGURED' });
    expect(fake.complete).not.toHaveBeenCalled();
    await closeAiApp(ctx);
  });

});
