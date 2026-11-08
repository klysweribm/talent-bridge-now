import { HttpError } from '@shared/infrastructure/httpError';
import { OpportunityDraftFailure } from './opportunityDraft.errors';
import { translateOpportunityDraftError } from './opportunityDraft.translate';

function translated(error: unknown): OpportunityDraftFailure {
  const result = translateOpportunityDraftError(error);
  expect(result).toBeInstanceOf(OpportunityDraftFailure);
  return result as OpportunityDraftFailure;
}

describe('translateOpportunityDraftError', () => {
  it('should read the code from body.code', () => {
    expect(translated(new HttpError(503, 'x', { code: 'AI_UNAVAILABLE', message: 'm' })).code).toBe('AI_UNAVAILABLE');
    expect(translated(new HttpError(504, 'x', { code: 'AI_TIMEOUT', message: 'm' })).code).toBe('AI_TIMEOUT');
  });

  it('should branch by code and not by status (inverted statuses)', () => {
    expect(translated(new HttpError(503, 'x', { code: 'AI_TIMEOUT', message: 'm' })).code).toBe('AI_TIMEOUT');
    expect(translated(new HttpError(504, 'x', { code: 'AI_UNAVAILABLE', message: 'm' })).code).toBe('AI_UNAVAILABLE');
  });

  it('should keep the server message for OPPORTUNITY_TEXT_TOO_LONG', () => {
    const failure = translated(new HttpError(400, 'Error HTTP 400', { code: 'OPPORTUNITY_TEXT_TOO_LONG', message: 'El texto supera el máximo de 123 caracteres' }));
    expect(failure.code).toBe('OPPORTUNITY_TEXT_TOO_LONG');
    expect(failure.serverMessage).toBe('El texto supera el máximo de 123 caracteres');
  });

  it('should give a generic failure when there is no code (DTO validation 400, 503 without code)', () => {
    expect(translated(new HttpError(400, 'Error HTTP 400', { message: ['text should not be empty'], error: 'Bad Request', statusCode: 400 })).code).toBe('UNKNOWN');
    expect(translated(new HttpError(503, 'x', null)).code).toBe('UNKNOWN');
    expect(translated(new HttpError(500, 'x', { code: 'OTHER' })).code).toBe('UNKNOWN');
  });

  it('should flag a network failure (status 0)', () => {
    expect(translated(new HttpError(0, 'Failed to fetch')).code).toBe('NETWORK');
  });

  it('should pass through errors that are not HttpError', () => {
    const boom = new Error('boom');
    expect(translateOpportunityDraftError(boom)).toBe(boom);
  });
});
