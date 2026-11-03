import { BadRequestException, ConflictException, NotFoundException, type Logger } from '@nestjs/common';
import { PROCESS_ERROR_CODES } from '../../domain/constants/process.constants';
import type { ICandidateDirectoryPort } from '../ports/candidate-directory.port';

/** Cuerpo de error consistente `{ statusCode, code, message }` con un código estable (DT-040). */
const coded = (statusCode: number, code: string, message: string): { statusCode: number; code: string; message: string } => ({ statusCode, code, message });

export const candidateLimitError = (max: number): BadRequestException =>
  new BadRequestException(coded(400, PROCESS_ERROR_CODES.candidateLimit, `A process can have at most ${max} candidates`));

export const terminalStateError = (status: string): BadRequestException =>
  new BadRequestException(coded(400, PROCESS_ERROR_CODES.terminalState, `The process is ${status} and can no longer be changed`));

export const alreadyAssignedError = (message = 'The candidate already belongs to a process'): ConflictException =>
  new ConflictException(coded(409, PROCESS_ERROR_CODES.candidateAlreadyAssigned, message));

export const assertWithinLimit = (count: number, max: number): void => {
  if (count > max) throw candidateLimitError(max);
};

/** Error HTTP para un candidato que no se pudo marcar. */
export const unavailableCandidate = (outcome: string): Error =>
  outcome === 'missing' ? new NotFoundException('Candidate not found') : alreadyAssignedError();

/** Revierte sin enmascarar el error original: si la liberación falla, solo se registra (ids). */
export async function releaseQuietly(directory: ICandidateDirectoryPort, logger: Logger, candidateId: string, processId: string): Promise<void> {
  try {
    await directory.release(candidateId, processId);
  } catch (error) {
    logger.error(`Rollback failed: could not release candidate=${candidateId} process=${processId}`, error);
  }
}
