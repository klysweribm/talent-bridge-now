import { BadRequestException, ConflictException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { OPPORTUNITY } from '../../testing/process-fakes';
import { build, pmActor } from '../../testing/process-service.setup';

describe('ProcessService.create with candidateIds', () => {
  it('should create the process and mark every candidate with its id', async () => {
    const { service, fakes } = build();
    fakes.addCandidate('c-1');
    fakes.addCandidate('c-2');
    const result = await service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, candidateIds: ['c-1', 'c-2'] }, pmActor);
    expect(result.candidateIds).toEqual(['c-1', 'c-2']);
    expect(fakes.candidates.get('c-1')?.processId).toBe(result.id);
    expect(fakes.candidates.get('c-2')?.processId).toBe(result.id);
  });

  it('should accept exactly the maximum and reject more with 400 naming it, creating nothing', async () => {
    const { service, create, fakes } = build();
    const ids = ['c-1', 'c-2', 'c-3', 'c-4', 'c-5', 'c-6'];
    ids.forEach((id) => fakes.addCandidate(id));
    await expect(service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, candidateIds: ids.slice(0, 5) }, pmActor)).resolves.toBeDefined();
    const error = await service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, candidateIds: ids }, pmActor).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BadRequestException);
    expect((error as BadRequestException).message).toContain('5');
    expect(create).toHaveBeenCalledTimes(1);
  });
});

describe('ProcessService.create with candidateIds validation and rollback', () => {
  it('should reject duplicated ids with 400, creating nothing', async () => {
    const { service, create, fakes } = build();
    fakes.addCandidate('c-1');
    await expect(service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, candidateIds: ['c-1', 'c-1'] }, pmActor)).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('should reject a busy candidate with 409 and a missing one with 404, creating nothing', async () => {
    const { service, create, fakes } = build();
    fakes.addCandidate('busy', 'p-other');
    fakes.addCandidate('free');
    await expect(service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, candidateIds: ['free', 'busy'] }, pmActor)).rejects.toBeInstanceOf(ConflictException);
    await expect(service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, candidateIds: ['free', 'ghost'] }, pmActor)).rejects.toBeInstanceOf(NotFoundException);
    expect(create).not.toHaveBeenCalled();
  });

  it('should roll back the marked candidates and the process when a claim fails midway', async () => {
    const { service, fakes } = build();
    fakes.addCandidate('c-1');
    fakes.addCandidate('c-2');
    fakes.spies.assign.mockImplementationOnce((id: string, processId: string) => {
      fakes.candidates.set(id, { id, fullName: 'x', processId });
      return Promise.resolve('assigned');
    }).mockRejectedValueOnce(new Error('mongo down'));
    await expect(service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, candidateIds: ['c-1', 'c-2'] }, pmActor)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fakes.candidates.get('c-1')?.processId).toBeUndefined();
    expect(fakes.processes.size).toBe(0);
  });
});
