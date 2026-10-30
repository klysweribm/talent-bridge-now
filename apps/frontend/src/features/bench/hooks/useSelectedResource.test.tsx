import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSelectedResource } from './useSelectedResource';

function setup(url: string): ReturnType<typeof renderHook<{ api: ReturnType<typeof useSelectedResource>; search: string }, unknown>> {
  const wrapper = ({ children }: { readonly children: ReactNode }): JSX.Element =>
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>;
  return renderHook(() => ({ api: useSelectedResource(), search: useLocation().search }), { wrapper });
}

describe('useSelectedResource', () => {
  it('should read the resource code from the URL', () => {
    expect(setup('/bench?resource=BN-0002').result.current.api.code).toBe('BN-0002');
  });

  it('should select a resource keeping filters and page', () => {
    const { result } = setup('/bench?skills=Java&page=3');
    act(() => result.current.api.select('BN-0001'));
    expect(result.current.search).toBe('?skills=Java&page=3&resource=BN-0001');
  });

  it('should replace the previous selection', () => {
    const { result } = setup('/bench?resource=BN-0001');
    act(() => result.current.api.select('BN-0002'));
    expect(result.current.search).toBe('?resource=BN-0002');
  });

  it('should close keeping the filters', () => {
    const { result } = setup('/bench?skills=Java&resource=BN-0001');
    act(() => result.current.api.close());
    expect(result.current.search).toBe('?skills=Java');
    expect(result.current.api.code).toBeNull();
  });
});
