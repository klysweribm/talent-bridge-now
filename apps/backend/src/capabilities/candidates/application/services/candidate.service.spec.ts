import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { ICandidate, ICandidateActor, ICreateCandidateRequest } from '@ibm-talent-bridge/shared-types';
import { DuplicateCandidateEmailError } from '../../domain/errors/duplicate-candidate-email.error';
import type { ICandidateRepositoryPort } from '../ports/candidate-repository.port';
import { CandidateService } from './candidate.service';

const NOW = '2026-11-01T00:00:00.000Z';
const ACTOR: ICandidateActor = { id: 'u-1', email: 'ana@example.test', role: 'recruiter' };
const stored = (request: ICreateCandidateRequest): ICandidate => ({
  ...request, id: 'c-1', status: 'tentative', createdAt: NOW, updatedAt: NOW, updateCount: 0,
});

function setup(): {
  service: CandidateService; findByEmail: jest.Mock; findById: jest.Mock; create: jest.Mock; replace: jest.Mock;
} {
  const findByEmail = jest.fn().mockResolvedValue(null);
  const findById = jest.fn().mockResolvedValue(null);
  const create = jest.fn((request: ICreateCandidateRequest) => Promise.resolve(stored(request)));
  const replace = jest.fn();
  const repository: ICandidateRepositoryPort = { findByEmail, findById, findSimilar: jest.fn(), create, replace, findByIds: jest.fn(), claimProcess: jest.fn(), releaseProcess: jest.fn(), findPage: jest.fn() };
  return { service: new CandidateService(repository), findByEmail, findById, create, replace };
}

describe('CandidateService.create', () => {
  it('should persist a tentative candidate with the email normalized and the actor', async () => {
    const { service, findByEmail, create } = setup();

    const candidate = await service.create({ email: '  Ana.Perez@Example.TEST ', fullName: 'Ana Pérez' }, ACTOR);

    expect(findByEmail).toHaveBeenCalledWith('ana.perez@example.test');
    expect(create).toHaveBeenCalledWith({ email: 'ana.perez@example.test', fullName: 'Ana Pérez' }, 'tentative', ACTOR);
    expect(candidate).toMatchObject({ id: 'c-1', status: 'tentative', email: 'ana.perez@example.test' });
  });

  it('should throw 400 with the existing candidate in the body when the email exists', async () => {
    const { service, findByEmail, create } = setup();
    const existing = stored({ email: 'ana@example.test', fullName: 'Existente' });
    findByEmail.mockResolvedValue(existing);

    const error = await service.create({ email: 'ANA@example.test', fullName: 'Otra' }, ACTOR).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).getResponse()).toMatchObject({ existing });
    expect(create).not.toHaveBeenCalled();
  });

  it('should resolve the race on the unique index to the same 400 with the existing candidate', async () => {
    const { service, findByEmail, create } = setup();
    const existing = stored({ email: 'ana@example.test', fullName: 'Ganadora' });
    findByEmail.mockResolvedValueOnce(null).mockResolvedValueOnce(existing);
    create.mockRejectedValue(new DuplicateCandidateEmailError());

    const error = await service.create({ email: 'ana@example.test', fullName: 'Perdedora' }, ACTOR).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).getResponse()).toMatchObject({ existing });
  });

  it('should rethrow unexpected repository errors untouched', async () => {
    const { service, create } = setup();
    create.mockRejectedValue(new Error('mongo down'));

    await expect(service.create({ email: 'a@b.co', fullName: 'A' }, ACTOR)).rejects.toThrow('mongo down');
  });
});

describe('CandidateService.update', () => {
  const request: ICreateCandidateRequest = { email: ' ANA@example.test ', fullName: 'Ana Nueva' };

  it('should replace the profile with the normalized request and the actor, and return the result', async () => {
    const { service, findById, replace } = setup();
    findById.mockResolvedValue(stored({ email: 'ana@example.test', fullName: 'Ana', summary: 'vieja' }));
    const updated: ICandidate = { ...stored({ email: 'ana@example.test', fullName: 'Ana Nueva' }), updatedBy: ACTOR, updateCount: 1 };
    replace.mockResolvedValue(updated);

    await expect(service.update('c-1', request, ACTOR)).resolves.toBe(updated);

    expect(replace).toHaveBeenCalledWith('c-1', { email: 'ana@example.test', fullName: 'Ana Nueva' }, ACTOR);
  });

  it('should throw 404 when the candidate does not exist', async () => {
    const { service, replace } = setup();

    await expect(service.update('nope', request, ACTOR)).rejects.toBeInstanceOf(NotFoundException);
    expect(replace).not.toHaveBeenCalled();
  });

  it('should throw 400 when the email differs from the stored one', async () => {
    const { service, findById, replace } = setup();
    findById.mockResolvedValue(stored({ email: 'otra@example.test', fullName: 'Otra' }));

    const error = await service.update('c-1', request, ACTOR).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).message).toMatch(/changing the email is not supported/i);
    expect(replace).not.toHaveBeenCalled();
  });

  it('should throw 404 when the candidate disappears between the read and the replace', async () => {
    const { service, findById, replace } = setup();
    findById.mockResolvedValue(stored({ email: 'ana@example.test', fullName: 'Ana' }));
    replace.mockResolvedValue(null);

    await expect(service.update('c-1', request, ACTOR)).rejects.toBeInstanceOf(NotFoundException);
  });
});
