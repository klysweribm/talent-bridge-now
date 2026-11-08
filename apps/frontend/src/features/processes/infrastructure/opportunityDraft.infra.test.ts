import { httpClient } from '@shared/infrastructure/httpClient';
import { HttpError } from '@shared/infrastructure/httpError';
import { generateOpportunityDraft } from './opportunityDraft.infra';
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
