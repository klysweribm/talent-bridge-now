import type { Logger } from '@nestjs/common';
import type { IUserProfile } from '@ibm-talent-bridge/shared-types';
import type { UserDirectoryService } from '../../../auth/application/services/user-directory.service';

interface IWithTechnicalRefs {
  readonly id: string;
  readonly technicalRefIds: readonly string[];
}

/**
 * Resuelve los referentes de uno o varios procesos con UNA sola consulta por ids únicos (ninguna si no hay ids).
 * Conserva el orden de `technicalRefIds` de cada proceso y omite, con warning que lleva solo ids, a los que ya no existen.
 * Incluye a los inactivos: el criterio es el mismo en el detalle y en la lista.
 */
export async function resolveTechnicalRefs(
  users: UserDirectoryService,
  processes: readonly IWithTechnicalRefs[],
  logger: Logger,
): Promise<Map<string, readonly IUserProfile[]>> {
  const uniqueIds = [...new Set(processes.flatMap((process) => process.technicalRefIds))];
  const byId = new Map<string, IUserProfile>();
  if (uniqueIds.length > 0) for (const profile of await users.findProfiles(uniqueIds)) byId.set(profile.id, profile);
  const resolved = new Map<string, readonly IUserProfile[]>();
  for (const process of processes) {
    const missing = process.technicalRefIds.filter((id) => !byId.has(id));
    if (missing.length > 0) logger.warn(`Process ${process.id} references missing technical referents: ids=${missing.join(',')}`);
    resolved.set(process.id, process.technicalRefIds.flatMap((id) => byId.get(id) ?? []));
  }
  return resolved;
}
