import { Logger } from '@nestjs/common';
import { ProcessCandidateClaimService } from './process-candidate-claim.service';
import { ProcessDetailService } from './process-detail.service';
import { ProcessService } from './process.service';
import { buildProcessFakes, type IProcessFakes } from '../../testing/process-fakes';
import { buildUsersFake, TECH_1, TECH_2, TECH_OFF, type IUsersFake } from '../../testing/process-users.fake';

function build(): { service: ProcessService; fakes: IProcessFakes; users: IUsersFake } {
  const fakes = buildProcessFakes();
  const users = buildUsersFake();
  const config = { maxCandidatesPerProcess: 5 };
  const claims = new ProcessCandidateClaimService(fakes.repository, fakes.directory, config);
  const service = new ProcessService(fakes.repository, users.service, config, claims, new ProcessDetailService(fakes.directory, users.service, config));
  return { service, fakes, users };
}

describe('ProcessService.list technicalRefs', () => {
  it('should resolve referents of several processes in ONE call, in order, sharing a referent', async () => {
    const { service, fakes, users } = build();
    fakes.addProcess({ id: 'p-1', technicalRefIds: [TECH_2, TECH_1] });
    fakes.addProcess({ id: 'p-2', technicalRefIds: [TECH_1] });
    fakes.addProcess({ id: 'p-3', technicalRefIds: [] });
    const { data } = await service.list(1, 20);
    expect(users.findProfiles).toHaveBeenCalledTimes(1);
    expect(data[0].technicalRefs).toEqual([{ id: TECH_2, fullName: `Nombre ${TECH_2}`, avatarUrl: 'https://x.test/a.png' }, { id: TECH_1, fullName: `Nombre ${TECH_1}` }]);
    expect(data[1].technicalRefs).toEqual([{ id: TECH_1, fullName: `Nombre ${TECH_1}` }]);
    expect(data[2].technicalRefs).toEqual([]);
  });

  it('should expose only id, fullName and avatarUrl', async () => {
    const { service, fakes } = build();
    fakes.addProcess({ technicalRefIds: [TECH_1] });
    const ref = (await service.list(1, 20)).data[0].technicalRefs[0];
    expect(Object.keys(ref)).toEqual(['id', 'fullName']);
  });

  it('should include inactive referents like the detail does', async () => {
    const { service, fakes } = build();
    fakes.addProcess({ technicalRefIds: [TECH_OFF] });
    expect((await service.list(1, 20)).data[0].technicalRefs.map((r) => r.id)).toEqual([TECH_OFF]);
  });

  it('should not call findProfiles when no process on the page has referents', async () => {
    const { service, fakes, users } = build();
    fakes.addProcess({ technicalRefIds: [] });
    await service.list(1, 20);
    expect(users.findProfiles).not.toHaveBeenCalled();
  });

  it('should omit missing referents with a warning without PII', async () => {
    const { service, fakes } = build();
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    fakes.addProcess({ technicalRefIds: ['ghost', TECH_1] });
    expect((await service.list(1, 20)).data[0].technicalRefs.map((r) => r.id)).toEqual([TECH_1]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ghost'));
    warn.mockRestore();
  });
});
