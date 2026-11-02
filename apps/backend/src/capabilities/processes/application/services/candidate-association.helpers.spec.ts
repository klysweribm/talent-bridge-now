import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { alreadyAssignedError, assertWithinLimit, candidateLimitError, terminalStateError, unavailableCandidate } from './candidate-association.helpers';

describe('candidate-association.helpers', () => {
  it('should throw 400 PROCESS_CANDIDATE_LIMIT naming the maximum only when the count exceeds it', () => {
    expect(() => assertWithinLimit(3, 3)).not.toThrow();
    expect(() => assertWithinLimit(4, 3)).toThrow(BadRequestException);
    const body = candidateLimitError(3).getResponse() as { code: string; message: string };
    expect(body.code).toBe('PROCESS_CANDIDATE_LIMIT');
    expect(body.message).toContain('3');
  });

  it('should build 409 CANDIDATE_ALREADY_ASSIGNED with the default or a custom message', () => {
    expect(alreadyAssignedError()).toBeInstanceOf(ConflictException);
    expect(alreadyAssignedError().getResponse()).toMatchObject({ statusCode: 409, code: 'CANDIDATE_ALREADY_ASSIGNED' });
    expect(alreadyAssignedError('custom').getResponse()).toMatchObject({ message: 'custom' });
  });

  it('should build 400 PROCESS_TERMINAL_STATE naming the status', () => {
    const body = terminalStateError('closed').getResponse() as { code: string; message: string };
    expect(body.code).toBe('PROCESS_TERMINAL_STATE');
    expect(body.message).toContain('closed');
  });

  it('should map assign outcomes to 404 for missing and 409 otherwise', () => {
    expect(unavailableCandidate('missing')).toBeInstanceOf(NotFoundException);
    expect(unavailableCandidate('taken')).toBeInstanceOf(ConflictException);
  });
});
