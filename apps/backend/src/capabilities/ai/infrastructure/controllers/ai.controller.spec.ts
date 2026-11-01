import 'reflect-metadata';
import { HttpException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { ROLES_KEY } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import type { AiCoordinatorService } from '../../application/services/ai-coordinator.service';
import type { AiStatusService } from '../../application/services/ai-status.service';
import { AskAiDto } from '../../domain/dto/ask-ai.dto';
import { AiController } from './ai.controller';

function setup(): { controller: AiController; ask: jest.Mock; getStatus: jest.Mock } {
  const ask = jest.fn();
  const getStatus = jest.fn();
  return { controller: new AiController({ ask } as unknown as AiCoordinatorService, { getStatus } as unknown as AiStatusService), ask, getStatus };
}
const dto = Object.assign(new AskAiDto(), { topic: 'general', query: 'Hola' });

describe('AiController', () => {
  it('should restrict every route to recruiter and pm behind JWT and roles guards', () => {
    expect(Reflect.getMetadata(ROLES_KEY, AiController)).toEqual(['recruiter', 'pm']);
    expect(Reflect.getMetadata(GUARDS_METADATA, AiController)).toEqual([JwtAuthGuard, RolesGuard]);
  });

  it('should apply a throttle stricter than the global one on POST /ai/ask', () => {
    const limit = Reflect.getMetadata('THROTTLER:LIMITdefault', Object.getOwnPropertyDescriptor(AiController.prototype, 'ask')?.value as object) as number;

    expect(limit).toBeGreaterThan(0);
    expect(limit).toBeLessThan(100);
  });

  it('should return the success result as is', async () => {
    const { controller, ask } = setup();
    const ok = { ok: true, answer: 'x', topic: 'general', source: 'ica', model: 'm' };
    ask.mockResolvedValue(ok);

    await expect(controller.ask(dto)).resolves.toBe(ok);
    expect(ask).toHaveBeenCalledWith({ topic: 'general', query: 'Hola' });
  });

  it('should throw a 503 carrying ok:false and the reason when the coordinator fails', async () => {
    const { controller, ask } = setup();
    ask.mockResolvedValue({ ok: false, reason: 'TIMEOUT' });

    const error = await controller.ask(dto).catch((e: HttpException) => e);

    expect(error).toBeInstanceOf(HttpException);
    expect((error as HttpException).getStatus()).toBe(503);
    expect((error as HttpException).getResponse()).toEqual({ ok: false, reason: 'TIMEOUT' });
  });

  it('should delegate GET /ai/status', async () => {
    const { controller, getStatus } = setup();
    getStatus.mockResolvedValue({ available: true, source: 'ica', model: 'm' });

    await expect(controller.status()).resolves.toEqual({ available: true, source: 'ica', model: 'm' });
  });
});
