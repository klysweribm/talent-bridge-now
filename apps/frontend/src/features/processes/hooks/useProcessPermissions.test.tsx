import { renderHook, waitFor } from '@testing-library/react';
import type { IProcessDetail } from '@ibm-talent-bridge/shared-types';
import { useAuthStore, type AuthUser } from '@features/auth/store/auth.store';
import * as infra from '../infrastructure/processCreate.infra';
import { createWrapper, mockProcessLimits } from '../test-utils';
import { useProcessPermissions } from './useProcessPermissions';

vi.mock('../infrastructure/processCreate.infra');

const PROCESS = { ownerPmId: 'pm1', recruiterId: 'rec1', status: 'open' } as IProcessDetail;
const user = (id: string, role: AuthUser['role']): AuthUser => ({ id, role, email: `${id}@ibm.com`, name: id });
const FULL = { canEdit: true, canChangeStatus: true, canManageCandidates: true, canChangeRecruiter: true };
const NONE = { canEdit: false, canChangeStatus: false, canManageCandidates: false, canChangeRecruiter: false };

const permissionsFor = async (current: AuthUser | null, process: Pick<IProcessDetail, 'ownerPmId' | 'recruiterId' | 'status'> = PROCESS): Promise<unknown> => {
  useAuthStore.setState({ user: current, token: current ? 't' : null });
  const { result } = renderHook(() => useProcessPermissions(process as IProcessDetail), { wrapper: createWrapper() });
  // Con límites disponibles el resultado se estabiliza tras la carga; sin acceso (technical_ref / anónimo) no hay carga.
  if (current && current.role !== 'technical_ref') await waitFor(() => expect(infra.fetchProcessLimits).toHaveBeenCalled());
  await new Promise(resolve => setTimeout(resolve, 0));
  return result.current;
};

describe('useProcessPermissions', () => {
  beforeEach(() => { vi.resetAllMocks(); mockProcessLimits(); });
  afterEach(() => useAuthStore.getState().clearAuth());

  it('should give the owner PM everything', async () => { expect(await permissionsFor(user('pm1', 'pm'))).toEqual(FULL); });
  it('should give the assigned recruiter everything except changing the recruiter', async () => {
    expect(await permissionsFor(user('rec1', 'recruiter'))).toEqual({ ...FULL, canChangeRecruiter: false });
  });
  it('should make any other PM read-only', async () => { expect(await permissionsFor(user('pm2', 'pm'))).toEqual(NONE); });
  it('should make any other recruiter read-only', async () => { expect(await permissionsFor(user('rec2', 'recruiter'))).toEqual(NONE); });
  it('should make a technical_ref read-only', async () => { expect(await permissionsFor(user('tr1', 'technical_ref'))).toEqual(NONE); });
  it('should make an anonymous visitor read-only', async () => { expect(await permissionsFor(null)).toEqual(NONE); });

  it.each(['closed', 'cancelled'] as const)('should allow nothing on a %s process, not even for the owner', async status => {
    expect(await permissionsFor(user('pm1', 'pm'), { ...PROCESS, status })).toEqual(NONE);
    expect(await permissionsFor(user('rec1', 'recruiter'), { ...PROCESS, status })).toEqual(NONE);
  });

  it('should not grant recruiter powers when the process has no recruiter', async () => {
    expect(await permissionsFor(user('rec1', 'recruiter'), { ...PROCESS, recruiterId: null })).toEqual(NONE);
  });

  it('should treat terminal statuses as the server says (a custom terminal set blocks an open process)', async () => {
    mockProcessLimits({ terminalStatuses: ['open'] });
    expect(await permissionsFor(user('pm1', 'pm'))).toEqual(NONE);
  });

  it('should grant nothing while limits are loading and never call the endpoint for a technical_ref', async () => {
    vi.mocked(infra.fetchProcessLimits).mockReturnValue(new Promise(() => undefined));
    useAuthStore.setState({ user: user('pm1', 'pm'), token: 't' });
    const { result } = renderHook(() => useProcessPermissions(PROCESS), { wrapper: createWrapper() });
    expect(result.current).toEqual(NONE);
    vi.mocked(infra.fetchProcessLimits).mockClear();
    await permissionsFor(user('tr1', 'technical_ref'));
    expect(infra.fetchProcessLimits).not.toHaveBeenCalled();
  });

  it('should grant nothing when the limits fail to load', async () => {
    vi.mocked(infra.fetchProcessLimits).mockRejectedValue(new Error('down'));
    expect(await permissionsFor(user('pm1', 'pm'))).toEqual(NONE);
  });
});
