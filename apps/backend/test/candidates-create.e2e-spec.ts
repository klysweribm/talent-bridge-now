import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type * as request from 'supertest';
import { CandidateModel, type CandidateDocument } from '../src/capabilities/candidates/infrastructure/adapters/candidate.schema';
import type { ICandidate, UserRole } from '@ibm-talent-bridge/shared-types';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { API, authed, buildAiApp, closeAiApp, http, type IAiTestContext } from './support/ai-e2e.helpers';

jest.setTimeout(30_000);

const URL = `${API}/candidates`;
const post = (ctx: IAiTestContext, role: UserRole, body: unknown): request.Test =>
  authed(ctx, http(ctx).post(URL).send(body as object), role);

describe('POST /candidates', () => {
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('cand', fakeAiPort().port); });
  afterAll(() => closeAiApp(ctx));

  it('should return 401 without a token and 403 for technical_ref', async () => {
    await http(ctx).post(URL).send({ email: 'a@b.co', fullName: 'A' }).expect(401);
    await post(ctx, 'technical_ref', { email: 'a@b.co', fullName: 'A' }).expect(403);
  });

  it.each<UserRole>(['recruiter', 'pm'])('should create a tentative candidate with a normalized email when the role is %s', async (role) => {
    const email = `Nuevo.${role}@Example.TEST`;
    const response = await post(ctx, role, {
      email, fullName: 'Persona Inventada', seniority: 'sr', skills: [{ name: 'Java', level: 5, years: 8 }, { name: 'Kafka' }],
      languages: [{ code: 'es', level: 'native' }], location: { country: 'Chile', city: 'Santiago' },
    }).expect(201);

    const body = response.body as ICandidate;
    expect(body).toMatchObject({
      status: 'tentative', email: email.toLowerCase(), fullName: 'Persona Inventada', seniority: 'sr',
      skills: [{ name: 'Java', level: 5, years: 8 }, { name: 'Kafka' }], location: { country: 'Chile', city: 'Santiago' },
    });
    expect([typeof body.id, typeof body.createdAt, typeof body.updatedAt]).toEqual(['string', 'string', 'string']);
    expect(response.body).not.toHaveProperty('_id');
    expect(response.body).not.toHaveProperty('__v');
  });

});

describe('POST /candidates duplicates', () => {
  let ctx: IAiTestContext;
  beforeAll(async () => {
    ctx = await buildAiApp('canddup', fakeAiPort().port);
    // Sin esperar a que exista el índice único, dos altas simultáneas podrían entrar ambas en una BD recién creada.
    await ctx.app.get<Model<CandidateDocument>>(getModelToken(CandidateModel.name)).init();
  });
  afterAll(() => closeAiApp(ctx));

  it('should return 400 with the existing candidate for a duplicate email, ignoring case and spaces', async () => {
    const first = await post(ctx, 'recruiter', { email: 'dup@example.test', fullName: 'Primera' }).expect(201);

    const second = await post(ctx, 'pm', { email: ' DUP@Example.Test ', fullName: 'Segunda' }).expect(400);

    expect(second.body).toMatchObject({ existing: { id: (first.body as { id: string }).id, fullName: 'Primera', status: 'tentative' } });
  });

  it('should create only one candidate when two requests race on the same email', async () => {
    const results = await Promise.all([
      post(ctx, 'recruiter', { email: 'carrera@example.test', fullName: 'A' }),
      post(ctx, 'recruiter', { email: 'carrera@example.test', fullName: 'B' }),
    ]);

    expect(results.map((r) => r.status).sort()).toEqual([201, 400]);
  });

});

describe('POST /candidates validation', () => {
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('candval', fakeAiPort().port); });
  afterAll(() => closeAiApp(ctx));

  it.each([
    ['missing email', { fullName: 'A' }],
    ['invalid email', { email: 'no-es-email', fullName: 'A' }],
    ['missing fullName', { email: 'a@b.co' }],
    ['blank fullName', { email: 'a@b.co', fullName: '   ' }],
    ['seniority outside the list', { email: 'a@b.co', fullName: 'A', seniority: 'god' }],
    ['skill level out of range', { email: 'a@b.co', fullName: 'A', skills: [{ name: 'X', level: 9 }] }],
    ['an unexpected field (status)', { email: 'a@b.co', fullName: 'A', status: 'hired' }],
    ['an invalid language code', { email: 'a@b.co', fullName: 'A', languages: [{ code: 'spanish', level: 'basic' }] }],
  ])('should return 400 for %s', async (_name, body) => {
    await post(ctx, 'recruiter', body).expect(400);
  });
});
