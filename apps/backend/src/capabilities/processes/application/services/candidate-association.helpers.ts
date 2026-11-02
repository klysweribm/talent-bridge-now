import { BadRequestException, ConflictException, NotFoundException, type Logger } from '@nestjs/common';
import type { ICandidateDirectoryPort } from '../ports/candidate-directory.port';

export const assertWithinLimit = (count: number, max: number): void => {
  if (count > max) throw new BadRequestException(`A process can have at most ${max} candidates`);
};

/** Error HTTP para un candidato que no se pudo marcar. */
export const unavailableCandidate = (outcome: string): Error =>
  outcome === 'missing'
    ? new NotFoundException('Candidate not found')
    : new ConflictException('The candidate already belongs to a process');

/** Revierte sin enmascarar el error original: si la liberación falla, solo se registra (ids). */
export async function releaseQuietly(directory: ICandidateDirectoryPort, logger: Logger, candidateId: string, processId: string): Promise<void> {
  try {
    await directory.release(candidateId, processId);
  } catch (error) {
    logger.error(`Rollback failed: could not release candidate=${candidateId} process=${processId}`, error);
  }
}
