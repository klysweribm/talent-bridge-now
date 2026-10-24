import type { User } from '@ibm-talent-bridge/shared-types';

/** Resultado de un login exitoso: el JWT firmado y el usuario que representa. */
export interface IAuthToken {
  readonly accessToken: string;
  readonly user: User;
}
