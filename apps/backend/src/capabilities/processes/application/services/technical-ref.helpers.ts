import { BadRequestException } from '@nestjs/common';
import type { UserDirectoryService } from '../../../auth/application/services/user-directory.service';
import { PROCESS_ERROR_CODES, PROCESS_TECHNICAL_REFS_MAX } from '../../domain/constants/process.constants';

const invalidRef = (message: string): BadRequestException =>
  new BadRequestException({ statusCode: 400, code: PROCESS_ERROR_CODES.invalidTechnicalRef, message });

/**
 * Valida el conjunto completo de referentes de un proceso: a lo sumo `PROCESS_TECHNICAL_REFS_MAX`, sin repetir,
 * y cada id debe ser un usuario existente con rol `technical_ref` y estado `active`. `[]` es válido (limpia).
 */
export async function assertValidTechnicalRefs(users: UserDirectoryService, ids: readonly string[]): Promise<void> {
  if (ids.length > PROCESS_TECHNICAL_REFS_MAX) throw invalidRef(`A process accepts at most ${PROCESS_TECHNICAL_REFS_MAX} technical referents`);
  if (new Set(ids).size !== ids.length) throw invalidRef('technicalRefIds must not contain duplicates');
  if (ids.length === 0) return;
  const profiles = await users.findProfiles(ids);
  const valid = new Set(profiles.filter((profile) => profile.role === 'technical_ref' && profile.status === 'active').map((profile) => profile.id));
  const rejected = ids.filter((id) => !valid.has(id));
  if (rejected.length > 0) throw invalidRef('Every technicalRefIds entry must be an existing active user with role technical_ref');
}
