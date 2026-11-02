import type * as request from 'supertest';
import type { ICandidate, ICvExtractionResult, UserRole } from '@ibm-talent-bridge/shared-types';
import type { IFakeAiPort } from '../../src/capabilities/ai/testing/fake-ai-port';
import { fakePdf } from '../../src/capabilities/candidates/testing/cv-fixtures';
import { API, authed, http, type IAiTestContext } from './ai-e2e.helpers';
import { send, stop } from './cv-e2e.helpers';

export const URL = `${API}/candidates`;
export const EMAIL = 'persona.inventada@example.test';
export const FULL = {
  email: EMAIL, fullName: 'Persona Inventada', phone: '+56 9 1234 5678', primaryRole: 'Backend', summary: 'Resumen',
  education: [{ institution: 'Uni Inventada', degree: 'Ing' }], skills: [{ name: 'Java' }],
};

export const call = (ctx: IAiTestContext, role: UserRole, method: 'post' | 'put', path: string, body: object): request.Test =>
  authed(ctx, http(ctx)[method](path).send(body), role);

export const createFull = async (ctx: IAiTestContext): Promise<ICandidate> =>
  (await call(ctx, 'recruiter', 'post', URL, FULL).expect(201)).body as ICandidate;

export async function extractDraft(ctx: IAiTestContext, fake: IFakeAiPort, draft: object): Promise<ICvExtractionResult> {
  fake.complete.mockResolvedValue(stop(JSON.stringify(draft)));
  return (await send(ctx, 'recruiter', fakePdf(), 'ica').expect(201)).body as ICvExtractionResult;
}
