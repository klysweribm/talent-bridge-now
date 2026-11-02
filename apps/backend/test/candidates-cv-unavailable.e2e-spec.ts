import { AiProviderError } from '../src/capabilities/ai/domain/errors/ai-provider.error';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { fakePdf } from '../src/capabilities/candidates/testing/cv-fixtures';
import { API, authed, buildAiApp, closeAiApp, http } from './support/ai-e2e.helpers';
import { arrange, send } from './support/cv-e2e.helpers';

jest.setTimeout(30_000);

describe('POST /candidates/cv-extraction when ICA is unavailable', () => {
  it('should return 503 { reason } (never 401), delete the file, and keep /bench and /auth working', async () => {
    const fake = fakeAiPort();
    arrange(fake);
    fake.complete.mockRejectedValue(new AiProviderError('boom', 'UNAUTHORIZED', 400));
    const ctx = await buildAiApp('cvfail', fake.port);

    const response = await send(ctx, 'recruiter', fakePdf(), 'ica').expect(503);
    const login = await http(ctx).post(`${API}/auth/dev-login`).send({ email: 'ana@ibm.com' }).expect(201);
    const bench = await authed(ctx, http(ctx).get(`${API}/bench`), 'recruiter').expect(200);

    expect(response.body).toEqual({ reason: 'UNAUTHORIZED' });
    expect(fake.deleteFile).toHaveBeenCalledWith('f-1');
    expect((login.body as { accessToken?: string }).accessToken).toEqual(expect.any(String));
    expect((bench.body as { total: number }).total).toBeGreaterThan(0);
    await closeAiApp(ctx);
  });

  it('should return 503 NOT_CONFIGURED when there is no ICA key', async () => {
    const fake = fakeAiPort();
    arrange(fake);
    const ctx = await buildAiApp('cvnokey', fake.port, { ICA_API_KEY: '' });

    const response = await send(ctx, 'pm', fakePdf(), 'ica').expect(503);

    expect(response.body).toEqual({ reason: 'NOT_CONFIGURED' });
    expect(fake.uploadFile).not.toHaveBeenCalled();
    await closeAiApp(ctx);
  });
});
