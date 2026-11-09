import 'reflect-metadata';
import type { HttpException } from '@nestjs/common';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { ROLES_KEY } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import { NO_BODY_LOG_KEY } from '../../../../shared/observability/no-body-log.decorator';
import type { OpportunityDraftFileService } from '../../application/services/opportunity-draft-file.service';
import { OpportunityDraftError } from '../../domain/errors/opportunity-draft.error';
import { OPPORTUNITY_DRAFT_THROTTLE_LIMIT, OPPORTUNITY_DRAFT_THROTTLE_TTL_MS } from '../../domain/opportunity-draft/opportunity-draft.constants';
import { OpportunityDraftFileController } from './opportunity-draft-file.controller';

const route = (): object => Object.getOwnPropertyDescriptor(OpportunityDraftFileController.prototype, 'opportunityDraftFile')?.value as object;
const upload = { originalname: 'a.pdf', mimetype: 'application/pdf', size: 1, buffer: Buffer.from('x') };
function setup(): { controller: OpportunityDraftFileController; draft: jest.Mock } {
  const draft = jest.fn();
  return { controller: new OpportunityDraftFileController({ draft } as unknown as OpportunityDraftFileService), draft };
}

describe('OpportunityDraftFileController — POST /ai/opportunity-draft/file', () => {
  it('should be restricted to recruiter and pm behind JWT and roles guards', () => {
    expect(Reflect.getMetadata(ROLES_KEY, OpportunityDraftFileController)).toEqual(['recruiter', 'pm']);
    expect(Reflect.getMetadata(GUARDS_METADATA, OpportunityDraftFileController)).toEqual([JwtAuthGuard, RolesGuard]);
  });

  it('should carry @NoBodyLog() on the handler (the file and the draft are free text)', () => {
    expect(Reflect.getMetadata(NO_BODY_LOG_KEY, route())).toBe(true);
  });

  it('should answer 200 and use the shared throttle constants', () => {
    expect(Reflect.getMetadata('__httpCode__', route())).toBe(200);
    expect(Reflect.getMetadata('THROTTLER:LIMITdefault', route())).toBe(OPPORTUNITY_DRAFT_THROTTLE_LIMIT);
    expect(Reflect.getMetadata('THROTTLER:TTLdefault', route())).toBe(OPPORTUNITY_DRAFT_THROTTLE_TTL_MS);
  });

  it('should return the draft as is', async () => {
    const { controller, draft } = setup();
    const response = { draft: {}, missingFields: [], warnings: [] };
    draft.mockResolvedValue(response);

    await expect(controller.opportunityDraftFile(upload)).resolves.toBe(response);
    expect(draft).toHaveBeenCalledWith(upload);
  });

  it('should turn OPPORTUNITY_SOURCE_UNREADABLE into a 422 with a { code, message } body', async () => {
    const { controller, draft } = setup();
    draft.mockRejectedValue(new OpportunityDraftError('OPPORTUNITY_SOURCE_UNREADABLE', 'No pudimos leer el documento'));

    const error = (await controller.opportunityDraftFile(upload).catch((e: HttpException) => e)) as HttpException;

    expect(error.getStatus()).toBe(422);
    expect(error.getResponse()).toEqual({ code: 'OPPORTUNITY_SOURCE_UNREADABLE', message: 'No pudimos leer el documento' });
  });

  it('should rethrow non-draft errors untouched (the 400 for a bad file)', async () => {
    const { controller, draft } = setup();
    draft.mockRejectedValue(new Error('boom'));

    await expect(controller.opportunityDraftFile(upload)).rejects.toThrow('boom');
  });
});
