import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ownerPm, setupUpdate } from '../../testing/process-update.setup';

const bodyOf = (error: unknown): unknown => (error as BadRequestException).getResponse();

/** El proceso está abierto al cargarlo, pero otro request lo deja en `terminal` antes del `update`. */
describe('ProcessUpdateService.update terminal state race', () => {
  it.each(['closed', 'cancelled'] as const)('should throw 400 PROCESS_TERMINAL_STATE and not overwrite when it became %s meanwhile', async (terminal) => {
    const { fakes, service } = setupUpdate();
    const stale = { ...fakes.processes.get('p-0')! };
    fakes.processes.set('p-0', { ...stale, status: terminal });
    (fakes.repository.findById as jest.Mock).mockResolvedValueOnce(stale);
    const error: unknown = await service.update('p-0', { status: 'open' }, ownerPm).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(BadRequestException);
    expect(bodyOf(error)).toMatchObject({ statusCode: 400, code: 'PROCESS_TERMINAL_STATE' });
    expect(fakes.processes.get('p-0')?.status).toBe(terminal);
  });

  it('should throw 404 when the process was deleted meanwhile', async () => {
    const { fakes, service } = setupUpdate();
    const stale = { ...fakes.processes.get('p-0')! };
    fakes.processes.delete('p-0');
    (fakes.repository.findById as jest.Mock).mockResolvedValueOnce(stale);
    await expect(service.update('p-0', { title: 'X' }, ownerPm)).rejects.toBeInstanceOf(NotFoundException);
  });
});
