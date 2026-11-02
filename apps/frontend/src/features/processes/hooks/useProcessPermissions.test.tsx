import { renderHook } from '@testing-library/react';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { useAuthStore, type AuthUser } from '@features/auth/store/auth.store';
import { useProcessPermissions } from './useProcessPermissions';

const PROCESS = { ownerPmId: 'pm1', recruiterId: 'rec1', status: 'open' } as IProcessDetail;
const user = (id: string, role: AuthUser['role']): AuthUser => ({ id, role, email: `${id}@ibm.com`, name: id });
const FULL = { canEdit: true, canChangeStatus: true, canManageCandidates: true, canChangeRecruiter: true };
const NONE = { canEdit: false, canChangeStatus: false, canManageCandidates: false, canChangeRecruiter: false };

const permissionsFor = (current: AuthUser | null, process: Pick<IProcessDetail, 'ownerPmId' | 'recruiterId' | 'status'> = PROCESS): unknown => {
  useAuthStore.setState({ user: current, token: current ? 't' : null });
  return renderHook(() => useProcessPermissions(process as IProcessDetail)).result.current;
};

describe('useProcessPermissions', () => {
  afterEach(() => useAuthStore.getState().clearAuth());

  it('should give the owner PM everything', () => { expect(permissionsFor(user('pm1', 'pm'))).toEqual(FULL); });
  it('should give the assigned recruiter everything except changing the recruiter', () => {
    expect(permissionsFor(user('rec1', 'recruiter'))).toEqual({ ...FULL, canChangeRecruiter: false });
  });
  it('should make any other PM read-only', () => { expect(permissionsFor(user('pm2', 'pm'))).toEqual(NONE); });
  it('should make any other recruiter read-only', () => { expect(permissionsFor(user('rec2', 'recruiter'))).toEqual(NONE); });
  it('should make a technical_ref read-only', () => { expect(permissionsFor(user('tr1', 'technical_ref'))).toEqual(NONE); });
  it('should make an anonymous visitor read-only', () => { expect(permissionsFor(null)).toEqual(NONE); });

  it.each(['closed', 'cancelled'] as const)('should allow nothing on a %s process, not even for the owner', status => {
    expect(permissionsFor(user('pm1', 'pm'), { ...PROCESS, status })).toEqual(NONE);
    expect(permissionsFor(user('rec1', 'recruiter'), { ...PROCESS, status })).toEqual(NONE);
  });

  it('should not grant recruiter powers when the process has no recruiter', () => {
    expect(permissionsFor(user('rec1', 'recruiter'), { ...PROCESS, recruiterId: null })).toEqual(NONE);
  });
});
