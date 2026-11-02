import { readFileSync } from 'fs';
import { join } from 'path';
import type { ICvExtractionResult } from '@ibm-talent-bridge/shared-types';
import { AiProviderError } from '../src/capabilities/ai/domain/errors/ai-provider.error';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { fakePdf } from '../src/capabilities/candidates/testing/cv-fixtures';
import { buildAiApp, closeAiApp, type IAiTestContext } from './support/ai-e2e.helpers';
import { arrange, send } from './support/cv-e2e.helpers';

jest.setTimeout(30_000);

/** Modo clásico con CV sintéticos REALES: reglas primero, ICA (puerto falso) completa los huecos; si falla, sigue funcionando. */
describe('POST /candidates/cv-extraction mode classic', () => {
  const fake = fakeAiPort();
  const fixture = (name: string): Buffer => readFileSync(join(__dirname, '../src/capabilities/candidates/testing/fixtures', name));
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('cvclassic', fake.port); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => arrange(fake));

  it.each([['cv-sintetico.pdf'], ['cv-sintetico.docx']])('should keep rules contact data from %s and complete the rest with ICA', async (name) => {
    const response = await send(ctx, 'recruiter', fixture(name), 'classic').expect(201);
    const body = response.body as ICvExtractionResult;

    expect(body).toMatchObject({
      extractor: 'classic', completedWith: 'ica-text',
      draft: { fullName: 'Lucia Fernandez Ortega', email: 'lucia.fernandez.demo@example.com', phone: '+54 11 5555-0142', seniority: 'sr', yearsExperience: 8 },
    });
    expect(body.missingFields).not.toContain('seniority');
    expect(fake.uploadFile).not.toHaveBeenCalled();
  });

  it.each<[string, () => void]>([
    ['the provider throws', () => fake.complete.mockRejectedValue(new Error('ica down'))],
    ['the AI is rejected', () => fake.complete.mockRejectedValue(new AiProviderError('x', 'UNAUTHORIZED', 400))],
  ])('should still return 201 with rules-only data and no completedWith when %s', async (_name, fail) => {
    fail();

    const response = await send(ctx, 'pm', fixture('cv-sintetico.pdf'), 'classic').expect(201);
    const body = response.body as ICvExtractionResult;

    expect(body.extractor).toBe('classic');
    expect(body.completedWith).toBeUndefined();
    expect(body.draft.email).toBe('lucia.fernandez.demo@example.com');
    expect(body.warnings).toContain('No se pudo completar con IA: se muestran solo los datos detectados por reglas.');
  });
});

describe('POST /candidates/cv-extraction mode classic guards', () => {
  const fake = fakeAiPort();
  const fixture = (name: string): Buffer => readFileSync(join(__dirname, '../src/capabilities/candidates/testing/fixtures', name));
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('cvclassicg', fake.port); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => arrange(fake));

  it('should return 400 for a file with a valid signature but unreadable content', async () => {
    await send(ctx, 'recruiter', fakePdf(), 'classic').expect(400);
  });

  it('should return 403 for technical_ref', async () => {
    await send(ctx, 'technical_ref', fixture('cv-sintetico.pdf'), 'classic').expect(403);
  });

  it('should keep classic mode working (201, no completedWith) when there is no ICA key', async () => {
    const fake = fakeAiPort();
    arrange(fake);
    const ctx = await buildAiApp('cvclassicnokey', fake.port, { ICA_API_KEY: '' });
    const pdf = readFileSync(join(__dirname, '../src/capabilities/candidates/testing/fixtures/cv-sintetico.pdf'));

    const response = await send(ctx, 'pm', pdf, 'classic').expect(201);

    expect(response.body).toMatchObject({ extractor: 'classic', draft: { email: 'lucia.fernandez.demo@example.com' } });
    expect((response.body as { completedWith?: string }).completedWith).toBeUndefined();
    expect(fake.complete).not.toHaveBeenCalled();
    await closeAiApp(ctx);
  });
});
