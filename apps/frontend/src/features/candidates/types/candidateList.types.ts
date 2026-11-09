import type { TCandidateAssignment } from '@ibm-talent-bridge/shared-types';

export interface ICandidateListParams {
  readonly page?:       number;
  readonly limit?:      number;
  /** Ausente = todos. */
  readonly assignment?: TCandidateAssignment;
}
