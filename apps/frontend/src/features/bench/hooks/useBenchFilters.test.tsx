import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useBenchFilters } from './useBenchFilters';

function setup(url: string): ReturnType<typeof renderHook<{ api: ReturnType<typeof useBenchFilters>; search: string }, unknown>> {
  const wrapper = ({ children }: { readonly children: ReactNode }): JSX.Element =>
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>;
  return renderHook(() => ({ api: useBenchFilters(), search: useLocation().search }), { wrapper });
}

describe('useBenchFilters', () => {
  it('should read the filters from the URL', () => {
    const { result } = setup('/bench?skills=Java&seniority=sr&page=2');
    expect(result.current.api.filters).toEqual({ skills: ['Java'], seniority: ['sr'], page: 2 });
  });

  it('should ignore invalid URL values', () => {
    const { result } = setup('/bench?seniority=guru&availableBy=no-es-fecha&page=-1&limit=500');
    expect(result.current.api.filters).toEqual({ skills: [], seniority: [] });
  });

  it('should write skills and seniority into the URL', () => {
    const { result } = setup('/bench');
    act(() => result.current.api.setSkills(['Java', 'Spring Boot']));
    act(() => result.current.api.setSeniority(['sr']));
    expect(new URLSearchParams(result.current.search).getAll('skills')).toEqual(['Java', 'Spring Boot']);
    expect(new URLSearchParams(result.current.search).getAll('seniority')).toEqual(['sr']);
  });

  it('should reset page to 1 when a filter changes', () => {
    const { result } = setup('/bench?page=3&country=Chile');
    act(() => result.current.api.setAvailableBy('2026-11-05'));
    expect(result.current.search).not.toContain('page=');
    expect(result.current.search).toContain('country=Chile');
    expect(result.current.search).toContain('availableBy=2026-11-05');
  });

  it('should keep the filters when only the page changes', () => {
    const { result } = setup('/bench?skills=Java&country=Chile');
    act(() => result.current.api.setPage(3));
    expect(result.current.api.filters).toEqual({ skills: ['Java'], seniority: [], country: 'Chile', page: 3 });
  });

  it('should clear every filter but keep the selected resource', () => {
    const { result } = setup('/bench?skills=Java&page=2&resource=BN-0001');
    act(() => result.current.api.clearFilters());
    expect(result.current.search).toBe('?resource=BN-0001');
  });

  it('should unset a single value when the setter receives undefined', () => {
    const { result } = setup('/bench?country=Chile&skills=Java');
    act(() => result.current.api.setCountry(undefined));
    expect(result.current.search).toBe('?skills=Java');
  });
});
