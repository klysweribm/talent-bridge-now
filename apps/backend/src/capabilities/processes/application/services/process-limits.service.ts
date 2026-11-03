import { Inject, Injectable } from '@nestjs/common';
import type { IProcessLimits } from '@ibm-talent-bridge/shared-types';
import {
  PROCESSES_CONFIG, PROCESS_BAND_MAX, PROCESS_BAND_MIN, PROCESS_OPPORTUNITY_ROLE_MAX, PROCESS_ROLE_DESCRIPTION_MAX, PROCESS_SKILLS_MAX,
  PROCESS_SKILLS_MIN, PROCESS_SKILL_MAX, PROCESS_TECHNICAL_REFS_MAX, TERMINAL_PROCESS_STATUSES,
} from '../../domain/constants/process.constants';
import type { IProcessesConfig } from '../../domain/interfaces/process-config.interface';

/** Límites expuestos por `GET /processes/limits`, armados con las mismas constantes que usan los DTOs y servicios. */
@Injectable()
export class ProcessLimitsService {
  constructor(@Inject(PROCESSES_CONFIG) private readonly config: IProcessesConfig) {}

  getLimits(): IProcessLimits {
    return {
      maxCandidates: this.config.maxCandidatesPerProcess,
      opportunity: {
        roleMax: PROCESS_OPPORTUNITY_ROLE_MAX,
        descriptionMax: PROCESS_ROLE_DESCRIPTION_MAX,
        skillsMin: PROCESS_SKILLS_MIN,
        skillsMax: PROCESS_SKILLS_MAX,
        skillMax: PROCESS_SKILL_MAX,
        bandMin: PROCESS_BAND_MIN,
        bandMax: PROCESS_BAND_MAX,
      },
      technicalRefsMax: PROCESS_TECHNICAL_REFS_MAX,
      terminalStatuses: [...TERMINAL_PROCESS_STATUSES],
    };
  }
}
