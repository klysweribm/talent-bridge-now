import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import type { IProcessListItem, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import { ProcessModel, type ProcessDocument } from '../../src/capabilities/processes/infrastructure/adapters/process.schema';
import { as, buildProcessesApp, closeProcessesApp, OPPORTUNITY, type IProcessesContext } from './processes-e2e.helpers';

export type TListPage = PaginatedResponse<IProcessListItem>;

export interface ISearchKit {
  readonly ctx: () => IProcessesContext;
  readonly create: (title: string, clientName: string, opportunityRole: string) => Promise<string>;
  readonly search: (q: string, extra?: string) => Promise<TListPage>;
  readonly titles: (page: TListPage) => string[];
}

/** App + Mongo reales con procesos sembrados (incluido uno legacy sin `opportunityRole`) para los e2e de `GET /processes?q=`. */
export function useSearchApp(label: string): ISearchKit {
  let ctx: IProcessesContext;
  const mariana = (): IProcessesContext['users']['mariana'] => ctx.users.mariana;
  const create: ISearchKit['create'] = async (title, clientName, opportunityRole) =>
    ((await as(ctx, mariana(), 'post', '/processes').send({ title, clientName, ...OPPORTUNITY, opportunityRole }).expect(201)).body as { id: string }).id;
  beforeAll(async () => {
    ctx = await buildProcessesApp(label);
    await create('Banca Digital', 'Banco Andino', 'Arquitecto Cloud');
    await create('Retail Core', 'Tienda Sur', 'Dev Senior Java');
    await create('Seguros (v2) [beta]', 'Aseguradora X', 'QA Lead');
    await create('Regex .* test', 'Cliente \\ Raro', 'Rol + especial');
    await create('Plano', 'Plano SA', 'Plano');
    const now = new Date();
    await ctx.app.get<Model<ProcessDocument>>(getModelToken(ProcessModel.name)).collection.insertOne({
      title: 'Proceso Legacy', clientName: 'Cliente Viejo', ownerPmId: mariana().id, recruiterId: ctx.users.ana.id, status: 'open', candidateIds: [],
      createdBy: { id: mariana().id, email: mariana().email, role: 'pm' }, createdAt: now, updatedAt: now,
    });
  });
  afterAll(() => closeProcessesApp(ctx));
  return {
    ctx: () => ctx,
    create,
    search: async (q, extra = '') => (await as(ctx, ctx.users.ana, 'get', `/processes?q=${encodeURIComponent(q)}${extra}`).expect(200)).body as TListPage,
    titles: (page) => page.data.map((item) => item.title).sort(),
  };
}
