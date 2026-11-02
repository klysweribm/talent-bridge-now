import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OPPORTUNITY, OTHER_PM, OTHER_REC, PM_ID, REC_ID } from '../../testing/process-fakes';
import { build, pmActor, recActor } from '../../testing/process-service.setup';

describe('ProcessService.create', () => {
  it('should persist and return the opportunity fields', async () => {
    const { service, create } = build();
    const result = await service.create({ ...OPPORTUNITY, title: 'T', clientName: 'C' }, pmActor);
    expect(result).toMatchObject(OPPORTUNITY);
    expect(create).toHaveBeenCalledWith(expect.objectContaining(OPPORTUNITY));
  });

  it('should set the PM actor as owner and ignore the body ownerPmId', async () => {
    const { service } = build();
    const result = await service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, ownerPmId: OTHER_PM }, pmActor);
    expect(result).toMatchObject({ ownerPmId: PM_ID, recruiterId: null, candidateIds: [], maxCandidates: 5, createdBy: pmActor });
  });

  it('should keep the chosen recruiter when a PM creates', async () => {
    const { service } = build();
    expect((await service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, recruiterId: OTHER_REC }, pmActor)).recruiterId).toBe(OTHER_REC);
  });

  it.each(['tech-1', 'pm-1', 'ghost'])('should reject recruiterId %s that is not a recruiter', async (recruiterId) => {
    const { service, create } = build();
    await expect(service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, recruiterId }, pmActor)).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('should require ownerPmId when a recruiter creates', async () => {
    const { service } = build();
    await expect(service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY }, recActor)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should use the recruiter actor id and ignore the body recruiterId', async () => {
    const { service } = build();
    const result = await service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, ownerPmId: OTHER_PM, recruiterId: OTHER_REC }, recActor);
    expect(result).toMatchObject({ ownerPmId: OTHER_PM, recruiterId: REC_ID, createdBy: recActor });
  });

  it.each(['tech-1', 'rec-2', 'ghost'])('should reject ownerPmId %s that is not a PM', async (ownerPmId) => {
    const { service, create } = build();
    await expect(service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, ownerPmId }, recActor)).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it('should accept an empty candidateIds', async () => {
    const { service } = build();
    await expect(service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, candidateIds: [] }, pmActor)).resolves.toMatchObject({ candidateIds: [] });
  });
});

describe('ProcessService reads', () => {
  it('should list a page of items with candidateCount and without candidateIds', async () => {
    const { service } = build();
    await service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY }, pmActor);
    const page = await service.list(1, 20);
    expect(page).toMatchObject({ total: 1, page: 1, limit: 20, totalPages: 1 });
    expect(page.data[0]).toMatchObject({ candidateCount: 0, maxCandidates: 5 });
    expect(page.data[0]).not.toHaveProperty('candidateIds');
  });

  it('should return the detail with real candidate summaries and skip orphans', async () => {
    const { service, fakes } = build();
    fakes.addCandidate('c-1');
    fakes.addCandidate('c-2');
    const created = await service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY, candidateIds: ['c-1', 'c-2'] }, pmActor);
    fakes.candidates.delete('c-2');
    const detail = await service.getById(created.id);
    expect(detail.candidates).toEqual([{ id: 'c-1', fullName: 'Nombre Secretisimo' }]);
    expect(detail.candidateIds).toEqual(['c-1', 'c-2']);
    expect((await service.list(1, 20)).data[0].candidateCount).toBe(2);
  });

  it('should return the detail with empty candidates', async () => {
    const { service } = build();
    const created = await service.create({ title: 'T', clientName: 'C', ...OPPORTUNITY }, pmActor);
    expect(await service.getById(created.id)).toMatchObject({ id: created.id, candidates: [], maxCandidates: 5 });
  });

  it('should throw NotFound when the process does not exist', async () => {
    const { service } = build();
    await expect(service.getById('nope')).rejects.toBeInstanceOf(NotFoundException);
  });
});
