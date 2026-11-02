import type { IProcessRepositoryPort } from '../application/ports/process-repository.port';
import type { ICandidateDirectoryPort } from '../application/ports/candidate-directory.port';
import { TERMINAL_PROCESS_STATUSES } from '../domain/constants/process.constants';
import type { ICandidateDirectoryEntry, TCandidateAssignOutcome } from '../domain/interfaces/candidate-directory.interface';
import type { INewProcess, IProcessChanges, TProcessRecord } from '../domain/interfaces/process-record.interface';

export const PM_ID = 'pm-1';
export const OTHER_PM = 'pm-2';
export const REC_ID = 'rec-1';
export const OTHER_REC = 'rec-2';
export const FULL_NAME = 'Nombre Secretisimo';

/** Campos de la oportunidad válidos para crear y para sembrar procesos en los tests. */
export const OPPORTUNITY = { opportunityRole: 'Dev Senior React', skills: ['React', 'AWS'], roleDescription: 'Perfil senior', band: 8 } as const;

export interface IProcessFakes {
  readonly processes: Map<string, TProcessRecord>;
  readonly candidates: Map<string, ICandidateDirectoryEntry>;
  readonly repository: IProcessRepositoryPort;
  readonly directory: ICandidateDirectoryPort;
  /** Los `jest.fn()` sueltos: afirmar sobre ellos no dispara `unbound-method`. */
  readonly spies: {
    readonly create: jest.Mock;
    readonly addCandidate: jest.Mock;
    readonly assign: jest.Mock;
    readonly release: jest.Mock;
  };
  addProcess(overrides?: Partial<TProcessRecord>): TProcessRecord;
  addCandidate(id: string, processId?: string): void;
}

type TProcessMap = Map<string, TProcessRecord>;
type TCandidateMap = Map<string, ICandidateDirectoryEntry>;
const STAMP = { createdAt: 'c', updatedAt: 'u' };
const ACTOR = { id: PM_ID, email: 'pm@example.test', role: 'pm' } as const;

function buildSpies(processes: TProcessMap, candidates: TCandidateMap): IProcessFakes['spies'] {
  const create = jest.fn((p: INewProcess) => {
    const record: TProcessRecord = { ...p, status: 'open', id: `p-${processes.size + 1}`, candidateIds: [...(p.candidateIds ?? [])], ...STAMP };
    processes.set(record.id, record);
    return Promise.resolve(record);
  });
  const addCandidate = jest.fn((id: string, candidateId: string, max: number) => {
    const current = processes.get(id);
    if (!current || current.candidateIds.includes(candidateId) || current.candidateIds.length >= max) return Promise.resolve(false);
    processes.set(id, { ...current, candidateIds: [...current.candidateIds, candidateId] });
    return Promise.resolve(true);
  });
  const assign = jest.fn((id: string, processId: string): Promise<TCandidateAssignOutcome> => {
    const found = candidates.get(id);
    if (!found) return Promise.resolve('missing');
    if (found.processId === processId) return Promise.resolve('already-assigned');
    if (found.processId !== undefined) return Promise.resolve('taken');
    candidates.set(id, { ...found, processId });
    return Promise.resolve('assigned');
  });
  const release = jest.fn((id: string, processId: string) => {
    const found = candidates.get(id);
    if (found?.processId !== processId) return Promise.resolve(false);
    candidates.set(id, { id: found.id, fullName: found.fullName });
    return Promise.resolve(true);
  });
  return { create, addCandidate, assign, release };
}

function buildRepository(processes: TProcessMap, spies: IProcessFakes['spies']): IProcessRepositoryPort {
  return {
    create: spies.create,
    addCandidate: spies.addCandidate,
    findById: jest.fn((id: string) => Promise.resolve(processes.get(id) ?? null)),
    findPaginated: jest.fn<Promise<readonly TProcessRecord[]>, [number, number]>(() => Promise.resolve([...processes.values()])),
    count: jest.fn(() => Promise.resolve(processes.size)),
    removeCandidate: jest.fn((id: string, candidateId: string) => {
      const current = processes.get(id);
      if (!current?.candidateIds.includes(candidateId)) return Promise.resolve(false);
      processes.set(id, { ...current, candidateIds: current.candidateIds.filter((c) => c !== candidateId) });
      return Promise.resolve(true);
    }),
    update: jest.fn((id: string, changes: IProcessChanges) => {
      const current = processes.get(id);
      if (!current || TERMINAL_PROCESS_STATUSES.includes(current.status)) return Promise.resolve(null);
      const next: TProcessRecord = { ...current, ...changes, candidateIds: [...(changes.candidateIds ?? current.candidateIds)] };
      processes.set(id, next);
      return Promise.resolve(next);
    }),
    delete: jest.fn((id: string) => { processes.delete(id); return Promise.resolve(); }),
  };
}

function buildDirectory(candidates: TCandidateMap, spies: IProcessFakes['spies']): ICandidateDirectoryPort {
  return {
    findByIds: jest.fn((ids: readonly string[]) =>
      Promise.resolve(ids.flatMap((id) => (candidates.has(id) ? [candidates.get(id) as ICandidateDirectoryEntry] : [])))),
    assign: spies.assign,
    release: spies.release,
  };
}

/** Fakes con estado de los dos puertos de salida; cada método es un `jest.fn` reemplazable. */
export function buildProcessFakes(): IProcessFakes {
  const processes: TProcessMap = new Map();
  const candidates: TCandidateMap = new Map();
  const spies = buildSpies(processes, candidates);
  return {
    processes, candidates, spies,
    repository: buildRepository(processes, spies),
    directory: buildDirectory(candidates, spies),
    addProcess: (overrides = {}) => {
      const record: TProcessRecord = {
        id: 'p-0', title: 'T', clientName: 'C', ...OPPORTUNITY, skills: [...OPPORTUNITY.skills], ownerPmId: PM_ID, recruiterId: REC_ID, status: 'open', candidateIds: [], createdBy: ACTOR, ...STAMP, ...overrides,
      };
      processes.set(record.id, record);
      return record;
    },
    addCandidate: (id, processId) => { candidates.set(id, { id, fullName: FULL_NAME, ...(processId ? { processId } : {}) }); },
  };
}
