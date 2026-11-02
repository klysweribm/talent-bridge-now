import { Inject, Injectable } from '@nestjs/common';
import type {
  ICandidate, ICandidateMatch, ICandidateMatches, ICandidateProfileDraft, TCandidateMatchReason,
} from '@ibm-talent-bridge/shared-types';
import { normalizeName, phoneKey } from '../../domain/candidate-similarity';
import { CANDIDATE_REPOSITORY_PORT } from '../../domain/constants/candidate.constants';
import type { ICandidateRepositoryPort } from '../ports/candidate-repository.port';

/** Busca perfiles guardados que coinciden con un borrador (UC-CAND-6). Sin logs: todo lo que maneja es PII. */
@Injectable()
export class CandidateMatchService {
  constructor(@Inject(CANDIDATE_REPOSITORY_PORT) private readonly repository: ICandidateRepositoryPort) {}

  async find(draft: ICandidateProfileDraft): Promise<ICandidateMatches> {
    const email = draft.email?.trim().toLowerCase() ?? '';
    const nameKey = normalizeName(draft.fullName ?? '') || undefined;
    const draftPhoneKey = phoneKey(draft.phone);

    const stored = email ? await this.repository.findByEmail(email) : null;
    const exact = stored ? this.toMatch(stored, 'email') : undefined;
    if (!nameKey && !draftPhoneKey) return exact ? { exact, similar: [] } : { similar: [] };

    const candidates = await this.repository.findSimilar({ nameKey, phoneKey: draftPhoneKey, excludeEmail: email });
    // Regla determinista: si coinciden nombre y teléfono, el motivo es 'name'.
    const similar = candidates.map((candidate) =>
      this.toMatch(candidate, nameKey && normalizeName(candidate.fullName) === nameKey ? 'name' : 'phone'));
    return exact ? { exact, similar } : { similar };
  }

  private toMatch(candidate: ICandidate, reason: TCandidateMatchReason): ICandidateMatch {
    return {
      id: candidate.id,
      fullName: candidate.fullName,
      email: candidate.email,
      ...(candidate.phone !== undefined && { phone: candidate.phone }),
      ...(candidate.primaryRole !== undefined && { primaryRole: candidate.primaryRole }),
      updatedAt: candidate.updatedAt,
      ...(candidate.updatedBy !== undefined && { updatedBy: candidate.updatedBy }),
      updateCount: candidate.updateCount,
      reason,
    };
  }
}
