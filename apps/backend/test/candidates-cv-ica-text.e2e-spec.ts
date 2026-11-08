import { readFileSync } from 'fs';
import { join } from 'path';
import type { UserRole } from '@ibm-talent-bridge/shared-types';
import { AiProviderError } from '../src/capabilities/ai/domain/errors/ai-provider.error';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { buildAiApp, closeAiApp, type IAiTestContext } from './support/ai-e2e.helpers';
import { arrange, send } from './support/cv-e2e.helpers';

jest.setTimeout(30_000);

/** Modo ica-text: el texto del CV se extrae en local y viaja en línea; nunca se sube el archivo. */
describe('POST /candidates/cv-extraction mode ica-text', () => {
  const fake = fakeAiPort();
  const fixture = (name: string): Buffer => readFileSync(join(__dirname, '../src/shared/document-text/testing/fixtures', name));
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('cvtext', fake.port); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => arrange(fake));

  it.each<UserRole>(['recruiter', 'pm'])('should return extractor ica-text for %s and never upload the file', async (role) => {
    const response = await send(ctx, role, fixture('cv-sintetico.pdf'), 'ica-text').expect(201);

    expect(response.body).toMatchObject({ extractor: 'ica-text', draft: { fullName: 'Persona Inventada' }, missingFields: [] });
    expect(fake.uploadFile).not.toHaveBeenCalled();
    const request = fake.complete.mock.calls[0][0];
    expect(request.fileIds).toBeUndefined();
    expect(request.messages.find((m) => m.role === 'user')?.content).toContain('Lucia Fernandez Ortega');
  });

  it('should return 503 { reason } (never 401) when the AI fails, and 403 for technical_ref', async () => {
    fake.complete.mockRejectedValue(new AiProviderError('boom', 'UNAUTHORIZED', 400));

    const response = await send(ctx, 'recruiter', fixture('cv-sintetico.docx'), 'ica-text').expect(503);

    expect(response.body).toEqual({ reason: 'UNAUTHORIZED' });
    await send(ctx, 'technical_ref', fixture('cv-sintetico.docx'), 'ica-text').expect(403);
  });
});
