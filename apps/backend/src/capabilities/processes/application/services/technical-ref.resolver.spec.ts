import { Logger } from '@nestjs/common';
import { resolveTechnicalRefs } from './technical-ref.resolver';
import { buildUsersFake, TECH_1, TECH_2, TECH_3 } from '../../testing/process-users.fake';

describe('resolveTechnicalRefs', () => {
  const logger = new Logger('test');

  it('should not query the directory when no process has referents', async () => {
    const users = buildUsersFake();
    const result = await resolveTechnicalRefs(users.service, [{ id: 'p-1', technicalRefIds: [] }], logger);
    expect(users.findProfiles).not.toHaveBeenCalled();
    expect(result.get('p-1')).toEqual([]);
  });

  it('should query once with unique ids, keeping each process order', async () => {
    const users = buildUsersFake();
    const result = await resolveTechnicalRefs(users.service, [
      { id: 'p-1', technicalRefIds: [TECH_2, TECH_1] }, { id: 'p-2', technicalRefIds: [TECH_1, TECH_3] }, { id: 'p-3', technicalRefIds: [] },
    ], logger);
    expect(users.findProfiles).toHaveBeenCalledTimes(1);
    expect([...(users.findProfiles.mock.calls[0] as [string[]])[0]].sort()).toEqual([TECH_1, TECH_2, TECH_3]);
    expect(result.get('p-1')?.map((p) => p.id)).toEqual([TECH_2, TECH_1]);
    expect(result.get('p-2')?.map((p) => p.id)).toEqual([TECH_1, TECH_3]);
    expect(result.get('p-3')).toEqual([]);
  });

  it('should omit missing referents and warn with ids only', async () => {
    const users = buildUsersFake();
    const warn = jest.spyOn(logger, 'warn').mockImplementation(() => undefined);
    const result = await resolveTechnicalRefs(users.service, [{ id: 'p-1', technicalRefIds: [TECH_1, 'ghost'] }], logger);
    expect(result.get('p-1')?.map((p) => p.id)).toEqual([TECH_1]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('ghost'));
    expect(String(warn.mock.calls[0][0])).not.toMatch(/Nombre|@example/);
    warn.mockRestore();
  });
});
