import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import {
  DEFAULT_MAX_CANDIDATES_PER_PROCESS, PROCESS_BAND_MAX, PROCESS_BAND_MIN, PROCESS_OPPORTUNITY_ROLE_MAX, PROCESS_ROLE_DESCRIPTION_MAX,
  PROCESS_SKILL_MAX, PROCESS_SKILLS_MAX, PROCESS_SKILLS_MIN, PROCESS_TECHNICAL_REFS_MAX, TERMINAL_PROCESS_STATUSES,
} from '../../domain/constants/process.constants';
import { CreateProcessDto } from '../../domain/dto/create-process.dto';
import { buildProcessesConfig } from '../../infrastructure/config/processes.config';
import { ProcessLimitsService } from './process-limits.service';

describe('ProcessLimitsService.getLimits', () => {
  it.each([5, 7])('should take maxCandidates %i from the config', (max) => {
    expect(new ProcessLimitsService({ maxCandidatesPerProcess: max }).getLimits().maxCandidates).toBe(max);
  });

  it('should fall back to the default when MAX_CANDIDATES_PER_PROCESS is missing', () => {
    const config = buildProcessesConfig({ get: () => undefined });
    expect(new ProcessLimitsService(config).getLimits().maxCandidates).toBe(DEFAULT_MAX_CANDIDATES_PER_PROCESS);
    expect(DEFAULT_MAX_CANDIDATES_PER_PROCESS).toBe(5);
  });

  it('should reflect exactly the domain constants', () => {
    expect(new ProcessLimitsService({ maxCandidatesPerProcess: 5 }).getLimits()).toEqual({
      maxCandidates: 5,
      opportunity: {
        roleMax: PROCESS_OPPORTUNITY_ROLE_MAX, descriptionMax: PROCESS_ROLE_DESCRIPTION_MAX, skillsMin: PROCESS_SKILLS_MIN,
        skillsMax: PROCESS_SKILLS_MAX, skillMax: PROCESS_SKILL_MAX, bandMin: PROCESS_BAND_MIN, bandMax: PROCESS_BAND_MAX,
      },
      technicalRefsMax: PROCESS_TECHNICAL_REFS_MAX,
      terminalStatuses: TERMINAL_PROCESS_STATUSES,
    });
  });

  it('should keep the DTO validating against the same constants the endpoint exposes', async () => {
    const { opportunity } = new ProcessLimitsService({ maxCandidatesPerProcess: 5 }).getLimits();
    const base = { title: 'T', clientName: 'C', opportunityRole: 'Dev', roleDescription: 'x', skills: ['a'], band: opportunity.bandMax };
    const check = async (patch: object): Promise<number> => (await validate(plainToInstance(CreateProcessDto, { ...base, ...patch }))).length;
    expect(await check({})).toBe(0);
    expect(await check({ band: opportunity.bandMax + 1 })).toBeGreaterThan(0);
    expect(await check({ band: opportunity.bandMin - 1 })).toBeGreaterThan(0);
    expect(await check({ opportunityRole: 'r'.repeat(opportunity.roleMax + 1) })).toBeGreaterThan(0);
    expect(await check({ roleDescription: 'd'.repeat(opportunity.descriptionMax + 1) })).toBeGreaterThan(0);
    expect(await check({ skills: Array.from({ length: opportunity.skillsMax + 1 }, (_, i) => `s${i}`) })).toBeGreaterThan(0);
    expect(await check({ skills: ['s'.repeat(opportunity.skillMax + 1)] })).toBeGreaterThan(0);
    expect(await check({ skills: [] })).toBeGreaterThan(0);
  });
});
