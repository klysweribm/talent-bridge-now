import type { ICandidate } from '@ibm-talent-bridge/shared-types';
import type { ICandidateRepositoryPort } from '../ports/candidate-repository.port';
import { CandidateMatchService } from './candidate-match.service';

const NOW = '2026-11-01T00:00:00.000Z';
const ACTOR = { id: 'u-1', email: 'ana@example.test', role: 'recruiter' } as const;
const candidate = (over: Partial<ICandidate>): ICandidate => ({
  id: 'c-1', email: 'x@example.test', fullName: 'Persona', status: 'tentative', createdAt: NOW, updatedAt: NOW, updateCount: 0,
  summary: 'no debe filtrarse', ...over,
});

function setup(): { service: CandidateMatchService; findByEmail: jest.Mock; findSimilar: jest.Mock } {
  const findByEmail = jest.fn().mockResolvedValue(null);
  const findSimilar = jest.fn().mockResolvedValue([]);
  const repository: ICandidateRepositoryPort = { findByEmail, findById: jest.fn(), findSimilar, create: jest.fn(), replace: jest.fn(), findByIds: jest.fn(), claimProcess: jest.fn(), releaseProcess: jest.fn(), findPage: jest.fn() };
  return { service: new CandidateMatchService(repository), findByEmail, findSimilar };
}

describe('CandidateMatchService.find', () => {
  it('should return the exact match as a summary with reason email, using the normalized email', async () => {
    const { service, findByEmail } = setup();
    findByEmail.mockResolvedValue(candidate({ id: 'c-9', email: 'ana@example.test', fullName: 'Ana', phone: '+56 9 1111 1111', updatedBy: ACTOR, updateCount: 2 }));

    const result = await service.find({ email: ' ANA@Example.test ' });

    expect(findByEmail).toHaveBeenCalledWith('ana@example.test');
    expect(result.exact).toEqual({
      id: 'c-9', fullName: 'Ana', email: 'ana@example.test', phone: '+56 9 1111 1111', updatedAt: NOW, updatedBy: ACTOR, updateCount: 2, reason: 'email',
    });
    expect(result.exact).not.toHaveProperty('summary');
  });

  it('should list a candidate with another email and the same name as similar with reason name', async () => {
    const { service, findSimilar } = setup();
    findSimilar.mockResolvedValue([candidate({ id: 'c-2', email: 'otra@example.test', fullName: 'Pérez José' })]);

    const result = await service.find({ email: 'jose@example.test', fullName: 'Jose Perez' });

    expect(findSimilar).toHaveBeenCalledWith({ nameKey: 'jose perez', phoneKey: undefined, excludeEmail: 'jose@example.test' });
    expect(result.similar).toEqual([expect.objectContaining({ id: 'c-2', reason: 'name' })]);
    expect(result.similar[0]).not.toHaveProperty('summary');
  });

  it('should use reason phone when only the phone key matches', async () => {
    const { service, findSimilar } = setup();
    findSimilar.mockResolvedValue([candidate({ id: 'c-3', fullName: 'Otro Nombre', phone: '099 1234 5678' })]);

    const result = await service.find({ fullName: 'Nombre Distinto', phone: '+56 9 1234 5678' });

    expect(findSimilar).toHaveBeenCalledWith(expect.objectContaining({ phoneKey: '12345678', excludeEmail: '' }));
    expect(result.similar).toEqual([expect.objectContaining({ id: 'c-3', reason: 'phone' })]);
  });

  it('should prefer reason name when both name and phone match', async () => {
    const { service, findSimilar } = setup();
    findSimilar.mockResolvedValue([candidate({ fullName: 'Ana Gomez', phone: '12345678' })]);

    const result = await service.find({ fullName: 'gomez ana', phone: '12345678' });

    expect(result.similar[0].reason).toBe('name');
  });
});

describe('CandidateMatchService.find without keys', () => {
  it('should not query by email nor similarity when the draft has no email, name or phone key', async () => {
    const { service, findByEmail, findSimilar } = setup();

    await expect(service.find({ phone: '123' })).resolves.toEqual({ similar: [] });

    expect(findByEmail).not.toHaveBeenCalled();
    expect(findSimilar).not.toHaveBeenCalled();
  });

  it('should return no exact when the email is not stored', async () => {
    const { service } = setup();

    await expect(service.find({ email: 'nadie@example.test' })).resolves.toEqual({ similar: [] });
  });
});
