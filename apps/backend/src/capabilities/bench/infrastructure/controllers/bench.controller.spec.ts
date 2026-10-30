import 'reflect-metadata';
import type { IBenchResource } from '@ibm-talent-bridge/shared-types';
import { GUARDS_METADATA } from '@nestjs/common/constants';
import { JwtAuthGuard } from '../../../../shared/auth/jwt-auth.guard';
import { ROLES_KEY } from '../../../../shared/auth/roles.decorator';
import { RolesGuard } from '../../../../shared/auth/roles.guard';
import type { BenchService } from '../../application/services/bench.service';
import { BenchQueryDto } from '../../domain/dto/bench-query.dto';
import { BenchController } from './bench.controller';

function fakeService(): jest.Mocked<Pick<BenchService, 'list' | 'getByCode' | 'listSkills'>> {
  return { list: jest.fn(), getByCode: jest.fn(), listSkills: jest.fn() };
}

describe('BenchController', () => {
  it('should restrict every route to recruiter and pm behind JWT and roles guards', () => {
    expect(Reflect.getMetadata(ROLES_KEY, BenchController)).toEqual(['recruiter', 'pm']);
    expect(Reflect.getMetadata(GUARDS_METADATA, BenchController)).toEqual([JwtAuthGuard, RolesGuard]);
  });

  it('should delegate the list query to the service', async () => {
    const service = fakeService();
    const page = { data: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    service.list.mockResolvedValue(page);
    const query = new BenchQueryDto();

    await expect(new BenchController(service as unknown as BenchService).list(query)).resolves.toBe(page);
    expect(service.list).toHaveBeenCalledWith(query);
  });

  it('should delegate the skills catalogue to the service', async () => {
    const service = fakeService();
    service.listSkills.mockResolvedValue(['Java']);

    await expect(new BenchController(service as unknown as BenchService).skills()).resolves.toEqual(['Java']);
  });

  it('should delegate the detail to the service by benchCode', async () => {
    const service = fakeService();
    const resource = { benchCode: 'BN-0001' } as IBenchResource;
    service.getByCode.mockResolvedValue(resource);

    await expect(new BenchController(service as unknown as BenchService).detail('BN-0001')).resolves.toBe(resource);
    expect(service.getByCode).toHaveBeenCalledWith('BN-0001');
  });

  it('should declare the skills route before the :benchCode route', () => {
    const names = Object.getOwnPropertyNames(BenchController.prototype);

    expect(names.indexOf('skills')).toBeLessThan(names.indexOf('detail'));
  });
});
