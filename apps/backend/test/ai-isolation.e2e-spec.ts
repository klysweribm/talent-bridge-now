import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { API, authed, buildAiApp, closeAiApp, http } from './support/ai-e2e.helpers';

jest.setTimeout(30_000);

const ASK = `${API}/ai/ask`;
const STATUS = `${API}/ai/status`;
const validBody = { topic: 'general', query: 'Hola' };

describe('AI isolation', () => {
  it('should keep GET /bench and POST /auth/dev-login working while the AI provider fails', async () => {
    const fake = fakeAiPort();
    fake.complete.mockRejectedValue(new TypeError('fetch failed'));
    fake.listModels.mockRejectedValue(new TypeError('fetch failed'));
    const ctx = await buildAiApp('resilience', fake.port);

    const login = await http(ctx).post(`${API}/auth/dev-login`).send({ email: 'ana@ibm.com' }).expect(201);
    const bench = await authed(ctx, http(ctx).get(`${API}/bench`), 'recruiter').expect(200);
    const ask = await authed(ctx, http(ctx).post(ASK).send(validBody), 'recruiter').expect(503);
    const status = await authed(ctx, http(ctx).get(STATUS), 'recruiter').expect(200);

    expect((login.body as { accessToken?: string }).accessToken).toEqual(expect.any(String));
    expect((bench.body as { total: number }).total).toBeGreaterThan(0);
    expect(ask.body).toEqual({ ok: false, reason: 'UNREACHABLE' });
    expect(status.body).toMatchObject({ available: false, reason: 'UNREACHABLE' });
    await closeAiApp(ctx);
  });
});
