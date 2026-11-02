import type { UserRole } from '@ibm-talent-bridge/shared-types';
import { fakeAiPort } from '../src/capabilities/ai/testing/fake-ai-port';
import { fakeDocx, fakeLegacyDoc, fakePdf, fakeText } from '../src/capabilities/candidates/testing/cv-fixtures';
import { API, authed, buildAiApp, closeAiApp, http, type IAiTestContext } from './support/ai-e2e.helpers';
import { arrange, CV_URL, send, stop } from './support/cv-e2e.helpers';

/** Pipeline HTTP real (guards, multipart, ValidationPipe) con Mongo real y un puerto de IA FALSO: nunca se llama a ICA. */
jest.setTimeout(30_000);

describe('POST /candidates/cv-extraction', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('cv', fake.port); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => arrange(fake));

  it('should return 401 without a token and 403 for technical_ref', async () => {
    await http(ctx).post(CV_URL).attach('file', fakePdf(), 'cv.pdf').field('mode', 'ica').expect(401);
    await send(ctx, 'technical_ref', fakePdf(), 'ica').expect(403);
    expect(fake.uploadFile).not.toHaveBeenCalled();
  });

  it.each<UserRole>(['recruiter', 'pm'])('should return the draft with extractor ica when the role is %s and delete the file', async (role) => {
    const response = await send(ctx, role, fakePdf(), 'ica').expect(201);

    expect(response.body).toMatchObject({
      extractor: 'ica', missingFields: [], warnings: [], draft: { fullName: 'Persona Inventada', email: 'persona.inventada@example.test', seniority: 'sr' },
    });
    expect(fake.deleteFile).toHaveBeenCalledWith('f-1');
  });

  it('should accept a DOCX by its magic bytes', async () => {
    await send(ctx, 'recruiter', fakeDocx(), 'ica').expect(201);
  });

  it('should drop a prompt-injected seniority and email from the draft', async () => {
    fake.complete.mockResolvedValue(stop(JSON.stringify({ fullName: 'Persona', seniority: 'god', email: 'admin@evil', role: 'admin' })));

    const response = await send(ctx, 'recruiter', fakePdf(), 'ica').expect(201);

    expect((response.body as { draft: unknown }).draft).toEqual({ fullName: 'Persona' });
  });

});

describe('POST /candidates/cv-extraction safety', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('cvsafe', fake.port); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => arrange(fake));

  it('should not persist any candidate', async () => {
    await send(ctx, 'recruiter', fakePdf(), 'ica').expect(201);

    const created = await authed(ctx, http(ctx).post(`${API}/candidates`).send({ email: 'persona.inventada@example.test', fullName: 'X' }), 'recruiter');
    expect(created.status).toBe(201);
  });

});

describe('POST /candidates/cv-extraction invalid input', () => {
  const fake = fakeAiPort();
  let ctx: IAiTestContext;
  beforeAll(async () => { ctx = await buildAiApp('cvbad', fake.port); });
  afterAll(() => closeAiApp(ctx));
  beforeEach(() => arrange(fake));

  it.each([
    ['an empty file', Buffer.alloc(0), 'ica'],
    ['a legacy .doc', fakeLegacyDoc(), 'ica'],
    ['a plain text file', fakeText(), 'ica'],
    ['a file over CV_MAX_FILE_BYTES', Buffer.concat([fakePdf(), Buffer.alloc(8192)]), 'ica'],
    ['a file far over the limit', Buffer.concat([fakePdf(), Buffer.alloc(200_000)]), 'ica'],
    ['an invalid mode', fakePdf(), 'turbo'],
  ])('should return 400 for %s', async (_name, file, mode) => {
    await send(ctx, 'recruiter', file, mode).expect(400);
    expect(fake.uploadFile).not.toHaveBeenCalled();
  });

  it('should return 400 when the file or the mode is missing', async () => {
    await send(ctx, 'recruiter', null, 'ica').expect(400);
    await send(ctx, 'recruiter', fakePdf()).expect(400);
  });
});
