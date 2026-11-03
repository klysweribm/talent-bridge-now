import { Logger } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import type { Model } from 'mongoose';
import type { UserDocument } from '../adapters/user.schema';
import { DEMO_USERS_SEED } from './demo-users.seed-data';
import { DemoUsersSeeder } from './demo-users.seeder';

function setup(enabled = 'true'): { seeder: DemoUsersSeeder; updateOne: jest.Mock } {
  const updateOne = jest.fn().mockReturnValue({ exec: () => Promise.resolve({}) });
  const model = { updateOne } as unknown as Model<UserDocument>;
  const config = { get: (key: string) => (key === 'AUTH_DEV_LOGIN_ENABLED' ? enabled : undefined) } as unknown as ConfigService;
  return { seeder: new DemoUsersSeeder(model, config), updateOne };
}

describe('DemoUsersSeeder', () => {
  beforeEach(() => jest.spyOn(Logger.prototype, 'log').mockImplementation());
  afterEach(() => jest.restoreAllMocks());

  it('should upsert every demo user by email without overwriting edited fields', async () => {
    const { seeder, updateOne } = setup();
    await seeder.onModuleInit();
    const upserts = (updateOne.mock.calls as Array<[{ email: string }, Record<string, Record<string, unknown>>, object?]>).filter(([, , options]) => options !== undefined);
    expect(upserts).toHaveLength(DEMO_USERS_SEED.length);
    for (const [filter, update, options] of upserts) {
      expect(DEMO_USERS_SEED.map((s) => s.email)).toContain(filter.email);
      expect(options).toEqual({ upsert: true });
      expect(Object.keys(update)).toEqual(['$setOnInsert']);
    }
  });

  it('should fill the new fields on existing users only where they are missing, without touching edited values', async () => {
    const { seeder, updateOne } = setup();
    await seeder.onModuleInit();
    const calls = updateOne.mock.calls as Array<[Record<string, unknown>, Record<string, Record<string, unknown>>]>;
    const fills = calls.filter(([, update]) => update.$set !== undefined);
    expect(fills.length).toBeGreaterThan(0);
    for (const [filter, update] of fills) {
      const [field] = Object.keys(update.$set);
      expect(filter[field]).toEqual({ $exists: false });
      expect(Object.keys(update)).toEqual(['$set']);
    }
  });

  it('should seed at least three referents with band and description', () => {
    const refs = DEMO_USERS_SEED.filter((u) => u.role === 'technical_ref');
    expect(refs.length).toBeGreaterThanOrEqual(3);
    for (const ref of refs) expect([typeof ref.band, typeof ref.description]).toEqual(['number', 'string']);
  });

  it('should do nothing when dev login is disabled', async () => {
    const { seeder, updateOne } = setup('false');
    await seeder.onModuleInit();
    expect(updateOne).not.toHaveBeenCalled();
  });
});
