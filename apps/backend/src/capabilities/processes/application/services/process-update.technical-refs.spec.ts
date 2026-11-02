import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { OTHER_PM, OTHER_REC } from '../../testing/process-fakes';
import { actorOf, assignedRec, ownerPm, setupUpdate } from '../../testing/process-update.setup';
import { TECH_1, TECH_2, TECH_3, TECH_OFF } from '../../testing/process-users.fake';

const bodyOf = (error: unknown): unknown => (error as BadRequestException).getResponse();
const refs = (ids: string[]): { technicalRefIds: string[] } => ({ technicalRefIds: ids });

describe('ProcessUpdateService.update technicalRefIds', () => {
  it('should assign one and then two referents and return their full profile in order', async () => {
    const { fakes, service } = setupUpdate();
    expect(await service.update('p-0', refs([TECH_1]), ownerPm)).toMatchObject({ technicalRefIds: [TECH_1] });
    const detail = await service.update('p-0', refs([TECH_2, TECH_1]), assignedRec);
    expect(detail.technicalRefIds).toEqual([TECH_2, TECH_1]);
    expect(detail.technicalRefs.map((ref) => ref.id)).toEqual([TECH_2, TECH_1]);
    expect(fakes.processes.get('p-0')?.technicalRefIds).toEqual([TECH_2, TECH_1]);
  });

  it('should replace the set and clear it with []', async () => {
    const { service } = setupUpdate();
    await service.update('p-0', refs([TECH_1, TECH_2]), ownerPm);
    expect((await service.update('p-0', refs([TECH_3]), ownerPm)).technicalRefIds).toEqual([TECH_3]);
    const cleared = await service.update('p-0', refs([]), ownerPm);
    expect([cleared.technicalRefIds, cleared.technicalRefs]).toEqual([[], []]);
  });

  it.each([
    ['an unknown id', ['ghost']],
    ['a pm', [OTHER_PM]],
    ['a recruiter', [OTHER_REC]],
    ['an inactive referent', [TECH_OFF]],
    ['a valid one next to an invalid one', [TECH_1, TECH_OFF]],
  ])('should throw 400 PROCESS_INVALID_TECHNICAL_REF for %s and not persist', async (_label, ids) => {
    const { fakes, service } = setupUpdate();
    const error = await service.update('p-0', refs(ids), ownerPm).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BadRequestException);
    expect(bodyOf(error)).toMatchObject({ statusCode: 400, code: 'PROCESS_INVALID_TECHNICAL_REF' });
    expect(fakes.processes.get('p-0')?.technicalRefIds).toEqual([]);
  });

  it('should throw 400 with a stable code for more than two or duplicated ids', async () => {
    const { service } = setupUpdate();
    for (const ids of [[TECH_1, TECH_2, TECH_3], [TECH_1, TECH_1]]) {
      expect(bodyOf(await service.update('p-0', refs(ids), ownerPm).catch((e: unknown) => e))).toMatchObject({ code: 'PROCESS_INVALID_TECHNICAL_REF' });
    }
  });

});

describe('ProcessUpdateService.update technicalRefIds authorization and state', () => {
  it.each([
    ['another pm', actorOf(OTHER_PM, 'pm')],
    ['another recruiter', actorOf(OTHER_REC, 'recruiter')],
    ['a technical_ref', actorOf(TECH_1, 'technical_ref')],
  ])('should throw 403 when %s assigns referents', async (_label, actor) => {
    const { fakes, service } = setupUpdate();
    await expect(service.update('p-0', refs([TECH_1]), actor)).rejects.toBeInstanceOf(ForbiddenException);
    expect(fakes.processes.get('p-0')?.technicalRefIds).toEqual([]);
  });

  it('should not let the creator without ownership assign referents', async () => {
    const { fakes, service } = setupUpdate();
    fakes.addProcess({ id: 'p-9', ownerPmId: OTHER_PM, recruiterId: null, createdBy: { id: OTHER_REC, email: 'x@example.test', role: 'recruiter' } });
    await expect(service.update('p-9', refs([TECH_1]), actorOf(OTHER_REC, 'recruiter'))).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should throw 400 PROCESS_TERMINAL_STATE on a closed process', async () => {
    const { fakes, service } = setupUpdate();
    fakes.addProcess({ id: 'p-c', status: 'closed' });
    expect(bodyOf(await service.update('p-c', refs([TECH_1]), ownerPm).catch((e: unknown) => e))).toMatchObject({ code: 'PROCESS_TERMINAL_STATE' });
  });

  it('should combine technicalRefIds with other fields in one update', async () => {
    const { service } = setupUpdate();
    expect(await service.update('p-0', { title: 'Nuevo', status: 'interviewing', ...refs([TECH_1]) }, ownerPm)).toMatchObject({
      title: 'Nuevo', status: 'interviewing', technicalRefIds: [TECH_1],
    });
  });

  it('should leave technicalRefIds untouched when the field is absent', async () => {
    const { service } = setupUpdate();
    await service.update('p-0', refs([TECH_1]), ownerPm);
    expect((await service.update('p-0', { title: 'X' }, ownerPm)).technicalRefIds).toEqual([TECH_1]);
  });
});
