import { BenchSeeder } from '../src/capabilities/bench/infrastructure/seed/bench.seeder';
import {
  RUN_ID, SEED, benchModel, buildApp, cleanEnv, countDocs, dropAndClose, useBenchApp,
} from './support/bench-e2e.helpers';

jest.setTimeout(30_000);

describe('Bench seed idempotence', () => {
  afterEach(() => cleanEnv());

  it('should leave exactly 30 documents when the app boots twice with the seed enabled', async () => {
    const dbName = `talent-bridge-bench-it-twice-${RUN_ID}`;
    const first = await buildApp(dbName, 'development', 'true');
    await first.app.close();
    const second = await buildApp(dbName, 'development', 'true');

    try {
      await second.app.get(BenchSeeder).onModuleInit();
      expect(await countDocs(second)).toBe(SEED.length);
    } finally {
      await dropAndClose(second);
    }
  });
});

describe('Bench seed fail-closed', () => {
  afterEach(() => cleanEnv());

  it.each([
    ['the flag is not set', 'development', undefined],
    ['NODE_ENV=production even with the flag on', 'production', 'true'],
  ])('should seed no document when %s', async (_label, nodeEnv, flag) => {
    const context = await buildApp(`talent-bridge-bench-it-off-${RUN_ID}`, nodeEnv, flag);

    try {
      expect(await countDocs(context)).toBe(0);
    } finally {
      await dropAndClose(context);
    }
  });
});

describe('Bench indexes', () => {
  const app = useBenchApp('idx');

  it('should create the unique benchCode index and the filter indexes', async () => {
    const model = benchModel(app.ctx);
    await model.init();
    const indexes = await model.collection.indexes();
    const byName = (name: string): (typeof indexes)[number] | undefined => indexes.find((i) => i.name === name);

    expect(byName('benchCode_1')?.unique).toBe(true);
    ['seniority_1', 'status_1', 'availableFrom_1', 'skills.name_1'].forEach((name) =>
      expect(byName(name)).toBeDefined(),
    );
  });
});
