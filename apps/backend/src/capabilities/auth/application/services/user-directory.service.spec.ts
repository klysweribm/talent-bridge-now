import type { UserRole } from '@ibm-talent-bridge/shared-types';
import type { IUserDirectoryPort } from '../ports/user-directory.port';
import { UserDirectoryService } from './user-directory.service';

function build(): { findOptionsByRole: jest.Mock; service: UserDirectoryService } {
  const findOptionsByRole = jest.fn().mockResolvedValue([{ id: 'u1', fullName: 'Ana' }]);
  const findRoleById = jest.fn((id: string) => Promise.resolve<UserRole | null>(id === 'u1' ? 'pm' : null));
  const port: IUserDirectoryPort = { findOptionsByRole, countByRole: jest.fn().mockResolvedValue(45), findRoleById };
  return { findOptionsByRole, service: new UserDirectoryService(port) };
}

describe('UserDirectoryService', () => {
  it('should return a paginated page of { id, fullName }', async () => {
    const { service, findOptionsByRole } = build();
    const result = await service.listByRole('pm', 2, 20);
    expect(result).toEqual({ data: [{ id: 'u1', fullName: 'Ana' }], total: 45, page: 2, limit: 20, totalPages: 3 });
    expect(findOptionsByRole).toHaveBeenCalledWith('pm', 2, 20);
  });

  it('should resolve the role of a user or null', async () => {
    const { service } = build();
    expect(await service.findRole('u1')).toBe('pm');
    expect(await service.findRole('zz')).toBeNull();
  });
});
