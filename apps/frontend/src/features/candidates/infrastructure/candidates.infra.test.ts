import { httpClient } from '@shared/infrastructure/httpClient';
import { HttpError } from '@shared/infrastructure/httpError';
import { createCandidate, extractCv, updateCandidate } from './candidates.infra';
import { CvExtractionUnavailableError, CandidateNotFoundError, CvInvalidFileError, DuplicateCandidateError } from './candidates.errors';
import { MOCK_CLASSIC_NOT_COMPLETED_MARKER, MOCK_DUPLICATE_EMAIL, MOCK_EXACT_MATCH_FILE_MARKER, MOCK_NOT_FOUND_ID, MOCK_SIMILAR_MATCH_FILE_MARKER, MOCK_UNAVAILABLE_FILE_MARKER } from './candidates.mock';
import { makeCandidate, makeFile } from '../test-utils';

const useMock = vi.hoisted(() => ({ value: true }));
vi.mock('@/config/env', () => ({ ENV: { get VITE_CANDIDATES_USE_MOCK() { return useMock.value; }, VITE_CV_MAX_FILE_BYTES: 5_242_880 } }));
vi.mock('@shared/infrastructure/httpClient', () => ({ httpClient: { post: vi.fn(), put: vi.fn() } }));

const post = vi.mocked(httpClient.post);
const put = vi.mocked(httpClient.put);

describe('candidates.infra (mock mode)', () => {
  beforeEach(() => { useMock.value = true; post.mockReset(); });

  it('should tag each mock result with the requested extractor and keep the shared schema', async () => {
    const results = await Promise.all((['ica', 'ica-text', 'classic'] as const).map(mode => extractCv({ file: makeFile(), mode })));
    expect(results.map(r => r.extractor)).toEqual(['ica', 'ica-text', 'classic']);
    results.forEach(r => expect(Object.keys(r)).toEqual(expect.arrayContaining(['draft', 'missingFields', 'warnings'])));
    expect(post).not.toHaveBeenCalled();
  });

  it('should complete the classic mock with ica-text unless the file carries the not-completed trigger', async () => {
    const completed = await extractCv({ file: makeFile(), mode: 'classic' });
    const plain = await extractCv({ file: makeFile(`${MOCK_CLASSIC_NOT_COMPLETED_MARKER}.pdf`), mode: 'classic' });
    expect(completed.completedWith).toBe('ica-text');
    expect(plain.completedWith).toBeUndefined();
    expect(plain.warnings.length).toBeGreaterThan(0);
  });

  it('should throw the unavailable error for ica-text too', async () => {
    await expect(extractCv({ file: makeFile(`${MOCK_UNAVAILABLE_FILE_MARKER}.pdf`), mode: 'ica-text' }))
      .rejects.toBeInstanceOf(CvExtractionUnavailableError);
  });

  it('should throw the unavailable error for ica when the file name carries the trigger, but not for classic', async () => {
    const file = makeFile(`${MOCK_UNAVAILABLE_FILE_MARKER}.pdf`);
    await expect(extractCv({ file, mode: 'ica' })).rejects.toBeInstanceOf(CvExtractionUnavailableError);
    await expect(extractCv({ file, mode: 'classic' })).resolves.toMatchObject({ extractor: 'classic' });
  });

  it('should throw the duplicate error with the existing candidate for the trigger email', async () => {
    await expect(createCandidate({ fullName: 'A', email: MOCK_DUPLICATE_EMAIL })).rejects.toBeInstanceOf(DuplicateCandidateError);
    await expect(createCandidate({ fullName: 'A', email: 'nuevo@example.com' })).resolves.toMatchObject({ status: 'tentative' });
  });

  it('should return matches.exact for the exact-match trigger file and matches.similar for the similar one', async () => {
    const exact = await extractCv({ file: makeFile(`${MOCK_EXACT_MATCH_FILE_MARKER}.pdf`), mode: 'ica-text' });
    expect(exact.draft.email).toBe('existente@example.com');
    expect(exact.matches?.exact).toMatchObject({ email: 'existente@example.com' });
    const similar = await extractCv({ file: makeFile(`${MOCK_SIMILAR_MATCH_FILE_MARKER}.pdf`), mode: 'ica-text' });
    expect(similar.draft.email).toBe('parecido@example.com');
    expect(similar.matches?.exact).toBeUndefined();
    expect(similar.matches?.similar).toHaveLength(1);
    expect((await extractCv({ file: makeFile(), mode: 'ica-text' })).matches).toBeUndefined();
  });

  it('should update in mock mode adding one to updateCount and recording a mock actor', async () => {
    const updated = await updateCandidate('mock-existing', { fullName: 'A', email: 'existente@example.com' });
    expect(updated).toMatchObject({ id: 'mock-existing', updateCount: 3, updatedBy: { role: 'recruiter' } });
    await expect(updateCandidate(MOCK_NOT_FOUND_ID, { fullName: 'A', email: 'a@example.com' })).rejects.toBeInstanceOf(CandidateNotFoundError);
    expect(put).not.toHaveBeenCalled();
  });
});

describe('candidates.infra (http mode)', () => {
  beforeEach(() => { useMock.value = false; post.mockReset(); put.mockReset(); });

  it('should PUT the request to /candidates/:id and map 404 to the not-found error', async () => {
    const request = { fullName: 'A', email: 'a@example.com' };
    put.mockResolvedValueOnce(makeCandidate());
    await updateCandidate('c1', request);
    expect(put).toHaveBeenCalledWith('/candidates/c1', request);
    put.mockRejectedValueOnce(new HttpError(404, 'no existe'));
    await expect(updateCandidate('c1', request)).rejects.toBeInstanceOf(CandidateNotFoundError);
    const other = new HttpError(400, 'otro correo');
    put.mockRejectedValueOnce(other);
    await expect(updateCandidate('c1', request)).rejects.toBe(other);
  });

  it('should POST multipart with file and mode to /candidates/cv-extraction', async () => {
    post.mockResolvedValue({ extractor: 'classic', draft: {}, missingFields: [], warnings: [] });
    const file = makeFile();
    await extractCv({ file, mode: 'classic' });
    const [path, body] = post.mock.calls[0];
    expect(path).toBe('/candidates/cv-extraction');
    expect((body as FormData).get('file')).toBe(file);
    expect((body as FormData).get('mode')).toBe('classic');
  });

  it('should map 503 to the unavailable error with its reason and 400 to the invalid-file error', async () => {
    post.mockRejectedValueOnce(new HttpError(503, 'x', { reason: 'UNREACHABLE' }));
    await expect(extractCv({ file: makeFile(), mode: 'ica' })).rejects.toMatchObject({ reason: 'UNREACHABLE' });
    post.mockRejectedValueOnce(new HttpError(400, 'Archivo corrupto'));
    await expect(extractCv({ file: makeFile(), mode: 'ica' })).rejects.toBeInstanceOf(CvInvalidFileError);
  });

  it('should map a 400 carrying the existing candidate to the duplicate error', async () => {
    const existing = makeCandidate();
    post.mockRejectedValueOnce(new HttpError(400, 'dup', { existing }));
    await expect(createCandidate({ fullName: 'A', email: 'a@example.com' })).rejects.toMatchObject({ existing });
  });
});
