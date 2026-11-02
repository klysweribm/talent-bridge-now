import type * as request from 'supertest';
import type { UserRole } from '@ibm-talent-bridge/shared-types';
import type { IFakeAiPort } from '../../src/capabilities/ai/testing/fake-ai-port';
import { VALID_DRAFT_JSON } from '../../src/capabilities/candidates/testing/cv-fixtures';
import { API, authed, http, type IAiTestContext } from './ai-e2e.helpers';

export const CV_URL = `${API}/candidates/cv-extraction`;
export const stop = (content: string): { content: string; finishReason: string; model: string } => ({ content, finishReason: 'stop', model: 'test-model' });

export function arrange(fake: IFakeAiPort): void {
  fake.uploadFile.mockReset().mockResolvedValue('f-1');
  fake.waitForFile.mockReset().mockResolvedValue('texto');
  fake.deleteFile.mockReset().mockResolvedValue(undefined);
  fake.complete.mockReset().mockResolvedValue(stop(JSON.stringify(VALID_DRAFT_JSON)));
  fake.listModels.mockReset().mockResolvedValue(['test-model']);
}

export const send = (ctx: IAiTestContext, role: UserRole, file: Buffer | null, mode?: string): request.Test => {
  const call = http(ctx).post(CV_URL);
  if (file) void call.attach('file', file, { filename: 'cv.pdf' });
  if (mode !== undefined) void call.field('mode', mode);
  return authed(ctx, call, role);
};

