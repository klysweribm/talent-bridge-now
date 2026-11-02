import { Logger } from '@nestjs/common';
import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { buildAiApp, closeAiApp, http, type IAiTestContext } from './support/ai-e2e.helpers';
import { call, createFull, EMAIL, FULL, URL } from './support/candidate-update.helpers';

jest.setTimeout(30_000);

describe('PUT /candidates/:id', () => {
  let ctx: IAiTestContext;
  let created: ICandidate;
  beforeAll(async () => { ctx = await buildAiApp('upd', fakeAiPort().port); created = await createFull(ctx); });
  afterAll(() => closeAiApp(ctx));

  it('should have stored createdBy from the JWT with updateCount 0 and no search keys', () => {
    expect(created).toMatchObject({ createdBy: { id: 'u-1', email: 'recruiter@example.test', role: 'recruiter' }, updateCount: 0 });
    expect(['updatedBy', 'nameKey', 'phoneKey'].filter((key) => key in created)).toEqual([]);
  });

  it('should replace the profile keeping email/status/createdBy and recording the caller', async () => {
    const response = await call(ctx, 'pm', 'put', `${URL}/${created.id}`, { email: EMAIL.toUpperCase(), fullName: 'Nombre Nuevo', phone: FULL.phone }).expect(200);
    const body = response.body as ICandidate;

    expect(body).toMatchObject({
      id: created.id, email: EMAIL, status: 'tentative', fullName: 'Nombre Nuevo', updateCount: 1,
      createdBy: created.createdBy, updatedBy: { id: 'u-1', email: 'pm@example.test', role: 'pm' }, createdAt: created.createdAt,
    });
    for (const gone of ['summary', 'primaryRole', 'nameKey']) expect(body).not.toHaveProperty(gone);
    // Mongoose rehidrata los arrays ausentes como [] (igual que en el alta): vacío = borrado.
    expect([body.education, body.skills]).toEqual([[], []]);
  });

  it('should unset the phone and increment the counter on a second replacement', async () => {
    const response = await call(ctx, 'pm', 'put', `${URL}/${created.id}`, { email: EMAIL, fullName: 'Nombre Nuevo' }).expect(200);

    expect(response.body).toMatchObject({ updateCount: 2 });
    expect(response.body).not.toHaveProperty('phone');
  });
});

describe('PUT /candidates/:id logging', () => {
  let ctx: IAiTestContext;
  let created: ICandidate;
  beforeAll(async () => { ctx = await buildAiApp('updlog', fakeAiPort().port); created = await createFull(ctx); });
  afterAll(() => closeAiApp(ctx));

  it('should not log personal data when updating', async () => {
    const spies = (['log', 'warn', 'error'] as const).map((level) => jest.spyOn(Logger.prototype, level));
    await call(ctx, 'recruiter', 'put', `${URL}/${created.id}`, { email: EMAIL, fullName: 'Persona Secretisima', phone: '+56 9 8765 4321' }).expect(200);

    const logged = JSON.stringify(spies.flatMap((spy) => spy.mock.calls));
    expect(logged).toContain('Candidate updated');
    for (const pii of ['Secretisima', EMAIL, '8765']) expect(logged).not.toContain(pii);
    spies.forEach((spy) => spy.mockRestore());
  });
});

describe('PUT /candidates/:id errors', () => {
  let ctx: IAiTestContext;
  let created: ICandidate;
  beforeAll(async () => { ctx = await buildAiApp('upderr', fakeAiPort().port); created = await createFull(ctx); });
  afterAll(() => closeAiApp(ctx));

  it('should return 404 for an unknown id and 400 for a malformed id, never 500', async () => {
    await call(ctx, 'recruiter', 'put', `${URL}/64b7f0f0f0f0f0f0f0f0f0f0`, FULL).expect(404);
    await call(ctx, 'recruiter', 'put', `${URL}/not-an-id`, FULL).expect(400);
  });

  it('should return 400 when the email differs from the stored one', async () => {
    await call(ctx, 'recruiter', 'put', `${URL}/${created.id}`, { ...FULL, email: 'distinto@example.test' }).expect(400);
  });

  it('should return 400 for an invalid body or audit fields sent by the client', async () => {
    await call(ctx, 'recruiter', 'put', `${URL}/${created.id}`, { ...FULL, updatedBy: { id: 'x' } }).expect(400);
    await call(ctx, 'recruiter', 'put', `${URL}/${created.id}`, { fullName: 'Sin email' }).expect(400);
  });

  it('should return 401 without a token and 403 for technical_ref', async () => {
    await http(ctx).put(`${URL}/${created.id}`).send(FULL).expect(401);
    await call(ctx, 'technical_ref', 'put', `${URL}/${created.id}`, FULL).expect(403);
  });
});
