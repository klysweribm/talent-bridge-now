import { render, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { ICandidate, ICandidateListItem, ICvExtractionResult, PaginatedResponse, TCvExtractor } from '@ibm-talent-bridge/shared-types';
import type { ReactElement } from 'react';

/** Solo datos inventados (cv-pii-handling.md). */
export function makeResult(extractor: TCvExtractor, overrides: Partial<ICvExtractionResult> = {}): ICvExtractionResult {
  return {
    extractor,
    draft: {
      fullName: 'Persona Inventada', email: 'persona@example.com', primaryRole: 'Backend Developer',
      seniority: 'sr', yearsExperience: 8, location: { country: 'Chile', city: 'Santiago' },
      skills: [{ name: 'Java', level: 5, years: 8 }, { name: 'Kafka' }],
      languages: [{ code: 'es', level: 'native' }],
      experience: [{ company: 'Empresa Ficticia', role: 'Dev' }],
    },
    missingFields: ['phone', 'linkedIn'],
    warnings: [],
    ...overrides,
  };
}

export function makeCandidate(overrides: Partial<ICandidate> = {}): ICandidate {
  return {
    id: 'c1', status: 'tentative', fullName: 'Existente Inventada', email: 'persona@example.com',
    createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z', updateCount: 0, ...overrides,
  };
}

export function makeFile(name = 'cv.pdf', type = 'application/pdf', content = 'contenido'): File {
  return new File([content], name, { type });
}

export function renderPage(ui: ReactElement, entry: string | { readonly pathname: string; readonly state: unknown } = '/candidates/new'): RenderResult {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[entry]}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Monta `ui` en `url` con QueryClient propio, `LocationProbe` y una ruta vecina opcional. */
export function renderAt(ui: ReactElement, url: string, extra?: { readonly path: string; readonly element: ReactElement }): RenderResult {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route path="*" element={ui} />
          {extra && <Route path={extra.path} element={extra.element} />}
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

/** Expone la query string actual para asertar sobre la URL. */
export function LocationProbe(): JSX.Element {
  return <output data-testid="search">{useLocation().search}</output>;
}

export function makeListItem(over: Partial<ICandidateListItem> = {}): ICandidateListItem {
  return { id: 'c1', fullName: 'Persona Inventada', email: 'persona@example.com', primaryRole: 'Backend Developer', createdAt: '2026-03-05T12:00:00.000Z', ...over };
}

export function makeListPage(data: readonly ICandidateListItem[], extra: Partial<PaginatedResponse<ICandidateListItem>> = {}): PaginatedResponse<ICandidateListItem> {
  return { data: [...data], total: data.length, page: 1, limit: 20, totalPages: 1, ...extra };
}
