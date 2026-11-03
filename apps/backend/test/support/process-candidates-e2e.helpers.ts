import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { IProcess } from '@ibm-talent-bridge/shared-types';
import { CandidateModel, type CandidateDocument } from '../../src/capabilities/candidates/infrastructure/adapters/candidate.schema';
import { as, buildProcessesApp, closeProcessesApp, OPPORTUNITY, type IDemoUser, type IProcessesContext } from './processes-e2e.helpers';

export interface IProcessCandidatesKit {
  readonly ctx: () => IProcessesContext;
  readonly candidates: () => Model<CandidateDocument>;
  readonly mariana: () => IDemoUser;
  readonly ana: () => IDemoUser;
  readonly newProcess: (owner: IDemoUser, extra?: object) => Promise<IProcess>;
  readonly stored: (id: string) => Promise<{ processId?: string } | null>;
  readonly associate: (user: IDemoUser | undefined, processId: string, candidateId: unknown) => ReturnType<typeof as>;
}

/** Registra beforeAll/afterAll (app + Mongo reales con base propia) y devuelve los atajos comunes de los e2e de asociación. */
export function useProcessCandidatesApp(label: string): IProcessCandidatesKit {
  let ctx: IProcessesContext;
  beforeAll(async () => { ctx = await buildProcessesApp(label); });
  afterAll(() => closeProcessesApp(ctx));
  const candidates = (): Model<CandidateDocument> => ctx.app.get<Model<CandidateDocument>>(getModelToken(CandidateModel.name));
  return {
    ctx: () => ctx,
    candidates,
    mariana: () => ctx.users.mariana,
    ana: () => ctx.users.ana,
    newProcess: async (owner, extra = {}) =>
      (await as(ctx, owner, 'post', '/processes').send({ title: 'Proceso Inventado', clientName: 'Cliente Inventado', ...OPPORTUNITY, ...extra }).expect(201)).body as IProcess,
    stored: (id) => candidates().findById(id).lean<{ processId?: string }>().exec(),
    associate: (user, processId, candidateId) => as(ctx, user, 'post', `/processes/${processId}/candidates`).send({ candidateId }),
  };
}
