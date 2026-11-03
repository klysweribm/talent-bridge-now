import { Logger } from '@nestjs/common';
import { ProcessDetailService } from './process-detail.service';
import { buildProcessFakes } from '../../testing/process-fakes';
import { buildUsersFake, TECH_1, TECH_2 } from '../../testing/process-users.fake';

function setup(technicalRefIds: string[]): { service: ProcessDetailService; users: ReturnType<typeof buildUsersFake>; record: ReturnType<ReturnType<typeof buildProcessFakes>['addProcess']> } {
  const fakes = buildProcessFakes();
  const users = buildUsersFake();
  const record = fakes.addProcess({ technicalRefIds });
  return { service: new ProcessDetailService(fakes.directory, users.service, { maxCandidatesPerProcess: 5 }), users, record };
}

describe('ProcessDetailService technicalRefs', () => {
  afterEach(() => jest.restoreAllMocks());

  it('should resolve all referents in a single query and keep the order of technicalRefIds', async () => {
    const { service, users, record } = setup([TECH_2, TECH_1]);
    const detail = await service.build(record);
    expect(users.findProfiles).toHaveBeenCalledTimes(1);
    expect(detail.technicalRefs.map((ref) => ref.id)).toEqual([TECH_2, TECH_1]);
    expect(detail.technicalRefs[1]).toEqual({
      id: TECH_1, fullName: `Nombre ${TECH_1}`, email: `${TECH_1}@example.test`, role: 'technical_ref', band: 8, description: 'Técnico Principal', status: 'active',
    });
    expect(detail.technicalRefs[0]).toMatchObject({ avatarUrl: 'https://x.test/a.png' });
    expect('avatarUrl' in detail.technicalRefs[1]).toBe(false);
  });

  it('should omit a missing referent and warn with the id only', async () => {
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    const { service, record } = setup([TECH_1, 'ghost-id']);
    const detail = await service.build(record);
    expect(detail.technicalRefs.map((ref) => ref.id)).toEqual([TECH_1]);
    const logged = JSON.stringify(warn.mock.calls);
    expect(logged).toContain('ghost-id');
    expect(logged).not.toContain('example.test');
  });

  it('should not query users when there are no referents', async () => {
    const { service, users, record } = setup([]);
    expect((await service.build(record)).technicalRefs).toEqual([]);
    expect(users.findProfiles).not.toHaveBeenCalled();
  });
});
