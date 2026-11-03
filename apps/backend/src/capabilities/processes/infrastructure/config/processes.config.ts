import type { ConfigService } from '@nestjs/config';
import { DEFAULT_MAX_CANDIDATES_PER_PROCESS } from '../../domain/constants/process.constants';
import type { IProcessesConfig } from '../../domain/interfaces/process-config.interface';

/** `MAX_CANDIDATES_PER_PROCESS` (entero > 0). Ausente o inválido -> 5. */
export function buildProcessesConfig(config: Pick<ConfigService, 'get'>): IProcessesConfig {
  const value = Number(config.get<string>('MAX_CANDIDATES_PER_PROCESS'));
  return { maxCandidatesPerProcess: Number.isInteger(value) && value > 0 ? value : DEFAULT_MAX_CANDIDATES_PER_PROCESS };
}
