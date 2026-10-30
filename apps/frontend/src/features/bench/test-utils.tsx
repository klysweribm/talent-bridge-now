import { render, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useLocation } from 'react-router-dom';
import type { IBenchResource, PaginatedResponse } from '@ibm-talent-bridge/shared-types';
import type { ReactElement, ReactNode } from 'react';

/** Expone la query string actual para asertar sobre la URL. */
export function LocationProbe(): JSX.Element {
  return <output data-testid="search">{useLocation().search}</output>;
}

export function makeResource(overrides: Partial<IBenchResource> = {}): IBenchResource {
  return {
    id: '1', benchCode: 'BN-0001', displayName: 'Lucía Fernández', primaryRole: 'Backend Developer',
    practice: 'Cloud', seniority: 'sr',
    skills: [
      { name: 'Java', level: 5, years: 8 }, { name: 'Spring Boot', level: 4, years: 6 },
      { name: 'Kafka', level: 3, years: 3 }, { name: 'SQL', level: 2, years: 2 },
    ],
    languages: [{ code: 'es', level: 'native' }, { code: 'en', level: 'advanced' }],
    location: { country: 'Argentina', city: 'Córdoba' },
    benchSince: '2026-01-10', availableFrom: '2020-01-01', status: 'available',
    ...overrides,
  };
}

export function makePage(
  data: readonly IBenchResource[],
  extra: Record<string, number> = {},
): PaginatedResponse<IBenchResource> {
  return { data: [...data], total: data.length, page: 1, limit: 20, totalPages: 1, ...extra };
}

export function renderAt(ui: ReactElement, url = '/bench'): RenderResult {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrap = (children: ReactNode): JSX.Element => (
    <QueryClientProvider client={client}><MemoryRouter initialEntries={[url]}>{children}<LocationProbe /></MemoryRouter></QueryClientProvider>
  );
  const result = render(wrap(ui));
  const rerender = result.rerender;
  return { ...result, rerender: (next: ReactNode) => rerender(wrap(next)) };
}
