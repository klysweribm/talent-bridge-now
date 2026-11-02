import { Injectable } from '@nestjs/common';
import { CandidateProcessLinkService } from '../../../candidates/application/services/candidate-process-link.service';
import type { ICandidateDirectoryPort } from '../../application/ports/candidate-directory.port';
import type { ICandidateDirectoryEntry, TCandidateAssignOutcome } from '../../domain/interfaces/candidate-directory.interface';

/** Delega en el servicio exportado por candidates (ADR-013); nunca toca su colección. */
@Injectable()
export class CandidateDirectoryAdapter implements ICandidateDirectoryPort {
  constructor(private readonly candidates: CandidateProcessLinkService) {}

  findByIds(ids: readonly string[]): Promise<readonly ICandidateDirectoryEntry[]> {
    return this.candidates.findSummaries(ids);
  }

  assign(candidateId: string, processId: string): Promise<TCandidateAssignOutcome> {
    return this.candidates.assign(candidateId, processId);
  }

  release(candidateId: string, processId: string): Promise<boolean> {
    return this.candidates.release(candidateId, processId);
  }
}
