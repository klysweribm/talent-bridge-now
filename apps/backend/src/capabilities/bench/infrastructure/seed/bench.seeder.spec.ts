import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { IBenchRepositoryPort } from '../../application/ports/bench-repository.port';
import { BenchSeeder } from './bench.seeder';

const EXPECTED_TOTAL = 30;

interface IFake {
  readonly port: IBenchRepositoryPort;
  readonly upsertMany: jest.Mock;
}

function fakePort(): IFake {
  const upsertMany = jest.fn().mockResolvedValue(EXPECTED_TOTAL);
  const port: IBenchRepositoryPort = {
    findPaginated: jest.fn(),
    count: jest.fn(),
    findByCode: jest.fn(),
    listSkillNames: jest.fn(),
    upsertMany,
  };
  return { port, upsertMany };
}

function fakeConfig(values: Record<string, string>): ConfigService {
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}

describe('BenchSeeder', () => {
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  afterEach(() => jest.restoreAllMocks());

  it('should not touch the repository when the seed is disabled', async () => {
    const fake = fakePort();

    await new BenchSeeder(fake.port, fakeConfig({ NODE_ENV: 'development' })).onModuleInit();

    expect(fake.upsertMany).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('skipped'));
  });

  it('should not touch the repository when NODE_ENV is production even with the flag on', async () => {
    const fake = fakePort();

    await new BenchSeeder(fake.port, fakeConfig({ NODE_ENV: 'production', BENCH_SEED_ENABLED: 'true' })).onModuleInit();

    expect(fake.upsertMany).not.toHaveBeenCalled();
  });

  it('should upsert the 30 validated resources once and log the count when the seed is enabled', async () => {
    const fake = fakePort();

    await new BenchSeeder(fake.port, fakeConfig({ NODE_ENV: 'development', BENCH_SEED_ENABLED: 'true' })).onModuleInit();

    expect(fake.upsertMany).toHaveBeenCalledTimes(1);
    expect((fake.upsertMany.mock.calls[0] as unknown[])[0]).toHaveLength(EXPECTED_TOTAL);
    expect(logSpy).toHaveBeenCalledWith('bench seed: 30 upserted');
  });
});
