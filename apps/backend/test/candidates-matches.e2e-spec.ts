import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { buildAiApp, closeAiApp, type IAiTestContext } from './support/ai-e2e.helpers';
import { arrange } from './support/cv-e2e.helpers';
import { call, createFull, EMAIL, extractDraft, URL } from './support/candidate-update.helpers';

jest.setTimeout(30_000);

describe('POST /candidates/cv-extraction matches', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  let created: ICandidate;
  beforeAll(async () => { ctx = await buildAiApp('match', fake.port); created = await createFull(ctx); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => arrange(fake));

  it('should return matches.exact as a summary with audit data when the email already exists', async () => {
    const result = await extractDraft(ctx, fake, { fullName: 'Persona Inventada', email: EMAIL.toUpperCase() });

    expect(result.matches?.exact).toMatchObject({ id: created.id, email: EMAIL, updateCount: 0, reason: 'email' });
    expect(result.matches?.exact).not.toHaveProperty('summary');
  });

  it('should list as similar a different-email candidate with the same name, and POST still works', async () => {
    const result = await extractDraft(ctx, fake, { fullName: 'inventada PERSONA', email: 'tercero@example.test', phone: '+34 600 11 22 33' });

    expect(result.matches?.exact).toBeUndefined();
    expect(result.matches?.similar).toEqual([expect.objectContaining({ id: created.id, reason: 'name' })]);
    await call(ctx, 'recruiter', 'post', URL, { email: 'tercero@example.test', fullName: 'inventada PERSONA' }).expect(201);
  });

  it('should list as similar a different-email candidate with the same last 8 phone digits', async () => {
    const result = await extractDraft(ctx, fake, { fullName: 'Alguien Distinto', email: 'cuarto@example.test', phone: '9 1234-5678' });

    expect(result.matches?.similar).toEqual([expect.objectContaining({ id: created.id, reason: 'phone' })]);
  });

  it('should omit matches when nothing matches', async () => {
    const result = await extractDraft(ctx, fake, { fullName: 'Sin Parecidos Aqui', email: 'nadie@example.test' });

    expect(result).not.toHaveProperty('matches');
  });
});
