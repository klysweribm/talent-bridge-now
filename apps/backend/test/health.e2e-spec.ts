import type { Server } from 'http';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { DB_STATUS_PORT, type IDbStatusPort } from '../src/monitoring/application/ports/db-status.port';
import { HealthModule } from '../src/monitoring/health.module';

/**
 * This e2e suite exercises the real HTTP pipeline (Nest's HTTP server,
 * exception filters, serialization) but overrides the DB status port so it
 * never needs a live MongoDB connection — intentional, so it runs in CI
 * without `docker-compose.test.yml` or any real Mongo instance.
 */
describe('Health (e2e)', () => {
  let app: INestApplication<Server>;
  const fakeDbStatusPort: IDbStatusPort = { isUp: jest.fn() };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [HealthModule],
    })
      .overrideProvider(DB_STATUS_PORT)
      .useValue(fakeDbStatusPort)
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 with database up when the port reports the database up', async () => {
    (fakeDbStatusPort.isUp as jest.Mock).mockReturnValue(true);

    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('should return 503 with database down when the port reports the database down', async () => {
    (fakeDbStatusPort.isUp as jest.Mock).mockReturnValue(false);

    const response = await request(app.getHttpServer()).get('/health').expect(503);

    expect(response.body).toMatchObject({ status: 'error', database: 'down' });
  });
});
