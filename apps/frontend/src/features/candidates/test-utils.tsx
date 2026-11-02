import { render, type RenderResult } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import type { ICandidate, ICvExtractionResult, TCvExtractor } from '@ibm-talent-bridge/shared-types';
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

export function renderPage(ui: ReactElement): RenderResult {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/candidates/new']}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}
