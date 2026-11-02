import type { IUserProfile, TUserStatus, UserRole } from '@ibm-talent-bridge/shared-types';
import type { UserDirectoryService } from '../../auth/application/services/user-directory.service';
import { OTHER_PM, OTHER_REC, PM_ID, REC_ID } from './process-fakes';

export const TECH_1 = 'tech-1';
export const TECH_2 = 'tech-2';
export const TECH_3 = 'tech-3';
export const TECH_OFF = 'tech-off';

export const profileOf = (id: string, role: UserRole, extra: Partial<IUserProfile> = {}): IUserProfile => ({
  id, fullName: `Nombre ${id}`, email: `${id}@example.test`, role, band: null, description: '', status: 'active' as TUserStatus, ...extra,
});

export interface IUsersFake {
  readonly service: UserDirectoryService;
  readonly profiles: Map<string, IUserProfile>;
  readonly findProfiles: jest.Mock;
}

/** Directorio de usuarios falso con estado: `findRole` y `findProfiles` leen del mismo mapa. */
export function buildUsersFake(): IUsersFake {
  const profiles = new Map<string, IUserProfile>(
    [
      profileOf(PM_ID, 'pm'), profileOf(OTHER_PM, 'pm'), profileOf(REC_ID, 'recruiter'), profileOf(OTHER_REC, 'recruiter'),
      profileOf(TECH_1, 'technical_ref', { band: 8, description: 'Técnico Principal' }), profileOf(TECH_2, 'technical_ref', { band: 9, avatarUrl: 'https://x.test/a.png' }),
      profileOf(TECH_3, 'technical_ref'), profileOf(TECH_OFF, 'technical_ref', { status: 'inactive' }),
    ].map((profile) => [profile.id, profile]),
  );
  const findRole = jest.fn((id: string) => Promise.resolve(profiles.get(id)?.role ?? null));
  const findProfiles = jest.fn((ids: readonly string[]) => Promise.resolve([...profiles.values()].filter((profile) => ids.includes(profile.id))));
  return { service: { findRole, findProfiles } as unknown as UserDirectoryService, profiles, findProfiles };
}
