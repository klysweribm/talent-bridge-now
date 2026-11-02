import type { TCandidateAssignment } from '@ibm-talent-bridge/shared-types';

export interface ICandidateListParams {
  readonly page?:       number;
  readonly limit?:      number;
  /** Ausente = todos. */
  readonly assignment?: TCandidateAssignment;
}

/** Origen de navegación hacia «Agregar candidato» (estado de react-router). */
export type TCandidateOrigin = 'new-process';

export interface ICandidateNavState {
  readonly from?: TCandidateOrigin;
}
