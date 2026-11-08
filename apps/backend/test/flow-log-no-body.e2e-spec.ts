import { Logger } from '@nestjs/common';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { FlowLogModule } from '../src/shared/observability/flow-log.module';
import { API, authed, buildAiApp, closeAiApp, http, type IAiTestContext } from './support/ai-e2e.helpers';

/** FlowLog activo + `@NoBodyLog()`: el texto libre del usuario no puede aparecer en el log (R3). El proveedor de IA es un puerto falso. */
jest.setTimeout(30_000);

const URL = `${API}/ai/opportunity-draft`;
const SECRET_TEXT = 'ZZ-TEXTO-INVENTADO-123';
const MAX = 200;
const DRAFT = {
  title: 'Fullstack', clientName: 'ITAU', opportunityRole: 'Fullstack', skills: ['React'],
  roleDescription: SECRET_TEXT, band: 8, startDate: '2026-12-01',
};

describe('FlowLog with @NoBodyLog() (e2e)', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  let logSpy: jest.SpyInstance;
  const printed = (): string => (logSpy.mock.calls as unknown[][]).map((call) => String(call[0])).join('\n');

  beforeAll(async () => {
    process.env.FLOW_LOG_ENABLED = 'true';
    ctx = await buildAiApp('flowlog', fake.port, { FLOW_LOG_ENABLED: 'true' }, [FlowLogModule]);
  });
  afterAll(async () => {
    await closeAiApp(ctx);
    delete process.env.FLOW_LOG_ENABLED;
  });
  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    fake.complete.mockReset().mockResolvedValue({ content: JSON.stringify(DRAFT), finishReason: 'stop', model: 'test-model' });
  });
  afterEach(() => logSpy.mockRestore());

  it('should omit the free text and the draft on the 200', async () => {
    await authed(ctx, http(ctx).post(URL).send({ text: SECRET_TEXT }), 'pm').expect(200);

    expect(printed()).toContain('Request:');
    expect(printed()).toContain('"omitted":true');
    expect(printed()).not.toContain(SECRET_TEXT);
  });

  it('should omit the text on the validation 400 (blank text with an extra field)', async () => {
    await authed(ctx, http(ctx).post(URL).send({ text: '   ', note: SECRET_TEXT }), 'pm').expect(400);

    expect(printed()).toContain('status: 400');
    expect(printed()).not.toContain(SECRET_TEXT);
  });

  it('should omit the text on OPPORTUNITY_TEXT_TOO_LONG', async () => {
    const text = `${SECRET_TEXT}${'x'.repeat(MAX)}`;
    await authed(ctx, http(ctx).post(URL).send({ text }), 'pm').expect(400);

    expect(printed()).toContain('status: 400');
    expect(printed()).not.toContain(SECRET_TEXT);
  });

  it('should keep printing the body of an unmarked endpoint', async () => {
    await http(ctx).post(`${API}/auth/dev-login`).send({ email: 'visible-body@example.test' });

    expect(printed()).toContain('visible-body@example.test');
  });
});
