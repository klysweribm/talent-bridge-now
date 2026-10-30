import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import { DEFAULT_LIMIT, DEFAULT_PAGE, DEFAULT_STATUSES } from '../../domain/constants/bench.constants';
import type { IBenchRepositoryPort } from '../ports/bench-repository.port';
import { BenchService } from './bench.service';

function resource(benchCode: string): IBenchResource {
  return {
    id: benchCode,
    benchCode,
    displayName: 'Persona Ficticia',
    primaryRole: 'Backend Developer',
    practice: 'Application Development',
    seniority: 'sr',
    skills: [{ name: 'Java', level: 4, years: 6 }],
    languages: [{ code: 'es', level: 'native' }],
    location: { country: 'Argentina', city: 'Buenos Aires' },
    benchSince: '2026-09-01',
    availableFrom: '2026-11-01',
    status: 'available',
  };
}

interface IFake {
  readonly port: IBenchRepositoryPort;
  readonly findPaginated: jest.Mock;
  readonly count: jest.Mock;
}

function buildFake(overrides: Partial<Record<keyof IBenchRepositoryPort, jest.Mock>> = {}): IFake {
  const findPaginated = overrides.findPaginated ?? jest.fn().mockResolvedValue([]);
  const count = overrides.count ?? jest.fn().mockResolvedValue(0);
  const port: IBenchRepositoryPort = {
    findPaginated,
    count,
    findByCode: overrides.findByCode ?? jest.fn().mockResolvedValue(null),
    listSkillNames: overrides.listSkillNames ?? jest.fn().mockResolvedValue([]),
    upsertMany: overrides.upsertMany ?? jest.fn().mockResolvedValue(0),
  };
  return { port, findPaginated, count };
}

describe('BenchService.list', () => {
  it('should query available and soft_booked with page 1 and the default limit when no filters are given', async () => {
    const fake = buildFake();

    await new BenchService(fake.port).list({});

    expect(fake.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ statuses: DEFAULT_STATUSES, skills: [], seniority: [] }),
      DEFAULT_PAGE,
      DEFAULT_LIMIT,
    );
    expect(fake.count).toHaveBeenCalledWith(expect.objectContaining({ statuses: DEFAULT_STATUSES }));
  });

  it('should honor an explicit status filter when status is given', async () => {
    const fake = buildFake();

    await new BenchService(fake.port).list({ status: ['assigned'] });

    expect(fake.findPaginated).toHaveBeenCalledWith(
      expect.objectContaining({ statuses: ['assigned'] }),
      DEFAULT_PAGE,
      DEFAULT_LIMIT,
    );
  });

});

describe('BenchService.list filters', () => {
  it('should pass skills, seniority, country and availableBy through when filters are given', async () => {
    const fake = buildFake();

    await new BenchService(fake.port).list({
      skills: ['Java', 'Spring Boot'],
      seniority: ['sr'],
      country: 'Chile',
      availableBy: '2026-11-15',
      page: 2,
      limit: 5,
    });

    expect(fake.findPaginated).toHaveBeenCalledWith(
      {
        skills: ['Java', 'Spring Boot'],
        seniority: ['sr'],
        statuses: DEFAULT_STATUSES,
        country: 'Chile',
        availableBy: new Date('2026-11-15'),
      },
      2,
      5,
    );
  });

});

describe('BenchService.list pagination', () => {
  it('should compute totalPages as ceil(total / limit) when the repository reports a total', async () => {
    const items = [resource('BN-0001'), resource('BN-0002')];
    const fake = buildFake({
      findPaginated: jest.fn().mockResolvedValue(items),
      count: jest.fn().mockResolvedValue(21),
    });

    const result = await new BenchService(fake.port).list({ page: 2, limit: 10 });

    expect(result).toEqual({ data: items, total: 21, page: 2, limit: 10, totalPages: 3 });
  });

  it('should return an empty page with totalPages 0 when nothing matches', async () => {
    const result = await new BenchService(buildFake().port).list({});

    expect(result).toEqual({ data: [], total: 0, page: DEFAULT_PAGE, limit: DEFAULT_LIMIT, totalPages: 0 });
  });
});

describe('BenchService.list invalid availableBy', () => {
  it('should throw BadRequestException without querying when availableBy is not a parseable date', async () => {
    const fake = buildFake();

    await expect(new BenchService(fake.port).list({ availableBy: '2026-W44' })).rejects.toThrow(
      BadRequestException,
    );
    expect(fake.findPaginated).not.toHaveBeenCalled();
  });
});

describe('BenchService.getByCode', () => {
  it('should return the resource when the code exists', async () => {
    const fake = buildFake({ findByCode: jest.fn().mockResolvedValue(resource('BN-0001')) });

    await expect(new BenchService(fake.port).getByCode('BN-0001')).resolves.toEqual(resource('BN-0001'));
  });

  it('should throw NotFoundException with the code when the code is unknown', async () => {
    const promise = new BenchService(buildFake().port).getByCode('BN-9999');

    await expect(promise).rejects.toThrow(new NotFoundException('Bench resource BN-9999 not found'));
  });
});

describe('BenchService.listSkills', () => {
  it('should return distinct skill names sorted alphabetically when the repository returns duplicates', async () => {
    const fake = buildFake({
      listSkillNames: jest.fn().mockResolvedValue(['React', 'Java', 'Angular', 'Java']),
    });

    await expect(new BenchService(fake.port).listSkills()).resolves.toEqual(['Angular', 'Java', 'React']);
  });

  it('should ask the repository only for skills of the default visible statuses', async () => {
    const listSkillNames = jest.fn().mockResolvedValue([]);

    await new BenchService(buildFake({ listSkillNames }).port).listSkills();

    expect(listSkillNames).toHaveBeenCalledWith(DEFAULT_STATUSES);
  });
});
