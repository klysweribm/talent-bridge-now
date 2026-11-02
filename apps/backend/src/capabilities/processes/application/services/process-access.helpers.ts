import { ForbiddenException, NotFoundException, type Logger } from '@nestjs/common';
import type { ICandidateActor } from '@ibm-talent-bridge/shared-types';
import { TERMINAL_PROCESS_STATUSES } from '../../domain/constants/process.constants';
import type { TProcessRecord } from '../../domain/interfaces/process-record.interface';
import type { IProcessRepositoryPort } from '../ports/process-repository.port';
import { terminalStateError } from './candidate-association.helpers';

export const isOwnerPm = (record: TProcessRecord, actor: ICandidateActor): boolean => actor.id === record.ownerPmId;

/** R6: solo el PM dueño o el reclutador asignado; `createdBy` no da derechos. */
export const isManager = (record: TProcessRecord, actor: ICandidateActor): boolean =>
  isOwnerPm(record, actor) || (record.recruiterId !== null && actor.id === record.recruiterId);

/**
 * Carga el proceso para modificarlo: 404 si no existe, 403 si no es PM dueño ni reclutador asignado,
 * 400 PROCESS_TERMINAL_STATE si está cerrado o cancelado (en ese orden).
 */
export async function loadManageableProcess(
  repository: IProcessRepositoryPort, logger: Logger, processId: string, actor: ICandidateActor,
): Promise<TProcessRecord> {
  const record = await repository.findById(processId);
  if (!record) throw new NotFoundException(`Process ${processId} not found`);
  if (!isManager(record, actor)) {
    logger.warn(`Process management forbidden: process=${processId} user=${actor.id}`);
    throw new ForbiddenException('Only the owner PM or the assigned recruiter can manage this process');
  }
  if (TERMINAL_PROCESS_STATUSES.includes(record.status)) throw terminalStateError(record.status);
  return record;
}
