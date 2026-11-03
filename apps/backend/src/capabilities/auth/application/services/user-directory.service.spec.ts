import type { IUserProfile, UserRole } from '@ibm-talent-bridge/shared-types';
import type { IUserDirectoryPort } from '../ports/user-directory.port';
import { UserDirectoryService } from './user-directory.service';

const PROFILE: IUserProfile = { id: 'u2', fullName: 'Martín', email: 'm@x.test', role: 'technical_ref', band: 8, description: '', status: 'active' };

function build(): { port: { findOptionsByRole: jest.Mock; countByRole: jest.Mock; findProfilesByIds: jest.Mock }; service: UserDirectoryService } {
  const findOptionsByRole = jest.fn().mockResolvedValue([{ id: 'u1', fullName: 'Ana' }]);
  const countByRole = jest.fn().mockResolvedValue(45);
  const findProfilesByIds = jest.fn().mockResolvedValue([PROFILE]);
  const findRoleById = jest.fn((id: string) => Promise.resolve<UserRole | null>(id === 'u1' ? 'pm' : null));
  const port: IUserDirectoryPort = { findOptionsByRole, countByRole, findRoleById, findProfilesByIds };
  return { port: { findOptionsByRole, countByRole, findProfilesByIds }, service: new UserDirectoryService(port) };
}

describe('UserDirectoryService', () => {
  it('should return a paginated page of { id, fullName }', async () => {
    const { service, port } = build();
    const result = await service.listByRole('pm', 2, 20);
    expect(result).toEqual({ data: [{ id: 'u1', fullName: 'Ana' }], total: 45, page: 2, limit: 20, totalPages: 3 });
    expect(port.findOptionsByRole).toHaveBeenCalledWith('pm', 2, 20, false);
    expect(port.countByRole).toHaveBeenCalledWith('pm', false);
  });

  it('should list only active users when the role is technical_ref, with a coherent count', async () => {
    const { service, port } = build();
    await service.listByRole('technical_ref', 1, 10);
    expect(port.findOptionsByRole).toHaveBeenCalledWith('technical_ref', 1, 10, true);
    expect(port.countByRole).toHaveBeenCalledWith('technical_ref', true);
  });

  it('should resolve the role of a user or null', async () => {
    const { service } = build();
    expect(await service.findRole('u1')).toBe('pm');
    expect(await service.findRole('zz')).toBeNull();
  });

  it('should resolve profiles by ids through the port', async () => {
    const { service, port } = build();
    expect(await service.findProfiles(['u2'])).toEqual([PROFILE]);
    expect(port.findProfilesByIds).toHaveBeenCalledWith(['u2']);
  });
});
