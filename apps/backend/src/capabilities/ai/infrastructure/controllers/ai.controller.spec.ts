import 'reflect-metadata';
import { HttpException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { ROLES_KEY } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import type { AiCoordinatorService } from '../../application/services/ai-coordinator.service';
import type { AiStatusService } from '../../application/services/ai-status.service';
import type { OpportunityDraftService } from '../../application/services/opportunity-draft.service';
import { AskAiDto } from '../../domain/dto/ask-ai.dto';
import { OpportunityDraftDto } from '../../domain/dto/opportunity-draft.dto';
import { OpportunityDraftError } from '../../domain/errors/opportunity-draft.error';
import { OPPORTUNITY_DRAFT_THROTTLE_LIMIT, OPPORTUNITY_DRAFT_THROTTLE_TTL_MS } from '../../domain/opportunity-draft/opportunity-draft.constants';
import { AiController } from './ai.controller';

function setup(): { controller: AiController; ask: jest.Mock; getStatus: jest.Mock } {
  const ask = jest.fn();
  const getStatus = jest.fn();
  return { controller: new AiController({ ask } as unknown as AiCoordinatorService, { getStatus } as unknown as AiStatusService, {} as OpportunityDraftService), ask, getStatus };
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

describe('AiController — POST /ai/opportunity-draft', () => {
  const draftDto = Object.assign(new OpportunityDraftDto(), { text: 'Fullstack React' });
  const route = (): object => Object.getOwnPropertyDescriptor(AiController.prototype, 'opportunityDraft')?.value as object;
  function setupDraft(): { controller: AiController; draft: jest.Mock } {
    const draft = jest.fn();
    return { controller: new AiController({} as never, {} as never, { draft } as unknown as OpportunityDraftService), draft };
  }

  it('should return the draft as is', async () => {
    const { controller, draft } = setupDraft();
    const response = { draft: {}, missingFields: [], warnings: [] };
    draft.mockResolvedValue(response);

    await expect(controller.opportunityDraft(draftDto)).resolves.toBe(response);
    expect(draft).toHaveBeenCalledWith('Fullstack React');
  });

  it('should answer 200 and use the shared throttle constants, not copied numbers', () => {
    expect(Reflect.getMetadata('__httpCode__', route())).toBe(200);
    expect(Reflect.getMetadata('THROTTLER:LIMITdefault', route())).toBe(OPPORTUNITY_DRAFT_THROTTLE_LIMIT);
    expect(Reflect.getMetadata('THROTTLER:TTLdefault', route())).toBe(OPPORTUNITY_DRAFT_THROTTLE_TTL_MS);
  });

  it.each([
    ['AI_UNAVAILABLE', 503],
    ['AI_TIMEOUT', 504],
    ['OPPORTUNITY_TEXT_TOO_LONG', 400],
  ] as const)('should turn %s into an HTTP %d with a { code, message } body', async (code, status) => {
    const { controller, draft } = setupDraft();
    draft.mockRejectedValue(new OpportunityDraftError(code, 'mensaje propio'));

    const error = (await controller.opportunityDraft(draftDto).catch((e: HttpException) => e)) as HttpException;

    expect(error).toBeInstanceOf(HttpException);
    expect(error.getStatus()).toBe(status);
    expect(error.getResponse()).toEqual({ code, message: 'mensaje propio' });
  });

  it('should rethrow unexpected errors untouched', async () => {
    const { controller, draft } = setupDraft();
    draft.mockRejectedValue(new Error('boom'));

    await expect(controller.opportunityDraft(draftDto)).rejects.toThrow('boom');
  });
});
