import { ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DB_STATUS_PORT, type IDbStatusPort } from './application/ports/db-status.port';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  let fakeDbStatusPort: IDbStatusPort;

  beforeEach(async () => {
    fakeDbStatusPort = { isUp: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DB_STATUS_PORT, useValue: fakeDbStatusPort }],
    }).compile();

    controller = moduleRef.get(HealthController);
  });

  it('should return status ok and database up when the port reports the database up', () => {
    (fakeDbStatusPort.isUp as jest.Mock).mockReturnValue(true);

    const result = controller.check();

    expect(result).toMatchObject({ status: 'ok', database: 'up' });
    expect(typeof result.timestamp).toBe('string');
  });

  it('should throw a 503 service unavailable when the port reports the database down', () => {
    (fakeDbStatusPort.isUp as jest.Mock).mockReturnValue(false);

    expect(() => controller.check()).toThrow(ServiceUnavailableException);
  });

  it('should include status error and database down in the thrown exception response', () => {
    (fakeDbStatusPort.isUp as jest.Mock).mockReturnValue(false);

    try {
      controller.check();
      fail('expected check() to throw');
    } catch (error) {
      expect(error).toBeInstanceOf(ServiceUnavailableException);
      const nestError = error as ServiceUnavailableException;
      expect(nestError.getResponse()).toMatchObject({ status: 'error', database: 'down' });
    }
  });
});
