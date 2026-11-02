import { HttpError } from '@shared/infrastructure/httpError';
import { PROCESS_ACTION_ERRORS, PROCESS_ERROR_CODES } from '../config/processActions.constants';
import { ProcessActionError, translateProcessActionError } from './processUpdate.translate';

const coded = (status: number, code: string): HttpError => new HttpError(status, 'english text', { statusCode: status, code, message: 'english text' });

describe('translateProcessActionError', () => {
  it.each([
    [coded(400, PROCESS_ERROR_CODES.terminalState), PROCESS_ACTION_ERRORS.terminalState],
    [coded(400, PROCESS_ERROR_CODES.candidateLimit), PROCESS_ACTION_ERRORS.candidateLimit],
    [coded(409, PROCESS_ERROR_CODES.candidateAlreadyAssigned), PROCESS_ACTION_ERRORS.candidateAlreadyAssigned],
    [coded(503, PROCESS_ERROR_CODES.releaseFailed), PROCESS_ACTION_ERRORS.releaseFailed],
  ])('should map the stable code of %o to its user copy', (error, copy) => {
    const result = translateProcessActionError(error);
    expect(result).toBeInstanceOf(ProcessActionError);
    expect(result.message).toBe(copy);
  });

  it('should not depend on the English message text', () => {
    const error = new HttpError(400, 'A process can have at most 5 candidates', { code: PROCESS_ERROR_CODES.candidateLimit });
    expect(translateProcessActionError(error).message).toBe(PROCESS_ACTION_ERRORS.candidateLimit);
  });

  it('should fall back to status for 403 and 404', () => {
    expect(translateProcessActionError(new HttpError(403, 'x')).message).toBe(PROCESS_ACTION_ERRORS.forbidden);
    expect(translateProcessActionError(new HttpError(404, 'x')).message).toBe(PROCESS_ACTION_ERRORS.notFound);
  });

  it('should use the no-changes-kept copy for an uncoded 503', () => {
    expect(translateProcessActionError(new HttpError(503, 'x')).message).toBe(PROCESS_ACTION_ERRORS.serviceUnavailable);
  });

  it('should return the generic copy for uncoded 400, unknown codes and non-HTTP errors', () => {
    expect(translateProcessActionError(new HttpError(400, 'title too long')).message).toBe(PROCESS_ACTION_ERRORS.generic);
    expect(translateProcessActionError(coded(400, 'SOMETHING_ELSE')).message).toBe(PROCESS_ACTION_ERRORS.generic);
    expect(translateProcessActionError(new Error('boom')).message).toBe(PROCESS_ACTION_ERRORS.generic);
  });
});
