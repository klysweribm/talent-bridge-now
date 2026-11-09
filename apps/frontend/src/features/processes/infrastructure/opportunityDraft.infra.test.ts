import { httpClient } from '@shared/infrastructure/httpClient';
import { HttpError } from '@shared/infrastructure/httpError';
import { generateOpportunityDraft, generateOpportunityDraftFromFile } from './opportunityDraft.infra';
import { OpportunityDraftFailure } from './opportunityDraft.errors';

vi.mock('@shared/infrastructure/httpClient', () => ({ httpClient: { post: vi.fn() } }));
const post = vi.mocked(httpClient.post);

describe('generateOpportunityDraft', () => {
  beforeEach(() => { post.mockReset(); });

  it('should POST /ai/opportunity-draft with { text } and return the response', async () => {
    const response = { draft: {}, missingFields: [], warnings: [] };
    post.mockResolvedValue(response);
    await expect(generateOpportunityDraft('hola')).resolves.toBe(response);
    expect(post).toHaveBeenCalledWith('/ai/opportunity-draft', { text: 'hola' });
  });

  it('should translate HTTP errors into OpportunityDraftFailure', async () => {
    const thrown = new HttpError(503, 'x', { code: 'AI_UNAVAILABLE', message: 'm' });
    post.mockRejectedValue(thrown);
    await expect(generateOpportunityDraft('hola')).rejects.toBeInstanceOf(OpportunityDraftFailure);
    await expect(generateOpportunityDraft('hola')).rejects.toMatchObject({ code: 'AI_UNAVAILABLE' });
  });
});

describe('generateOpportunityDraftFromFile', () => {
  beforeEach(() => { post.mockReset(); });

  it('should POST /ai/opportunity-draft/file as multipart with the file in field "file"', async () => {
    const response = { draft: {}, missingFields: [], warnings: [] };
    post.mockResolvedValue(response);
    const file = new File(['x'], 'brochure.pdf', { type: 'application/pdf' });
    await expect(generateOpportunityDraftFromFile(file)).resolves.toBe(response);
    const [path, body] = post.mock.calls[0] ?? [];
    expect(path).toBe('/ai/opportunity-draft/file');
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('file')).toBe(file);
  });

  it('should translate a 422 OPPORTUNITY_SOURCE_UNREADABLE into OpportunityDraftFailure', async () => {
    post.mockRejectedValue(new HttpError(422, 'x', { code: 'OPPORTUNITY_SOURCE_UNREADABLE', message: 'm' }));
    await expect(generateOpportunityDraftFromFile(new File(['x'], 'a.pdf'))).rejects.toMatchObject({ code: 'OPPORTUNITY_SOURCE_UNREADABLE' });
  });
});
