import { vi } from 'vitest';
import { render, screen, type RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';
import type { IProcessLimits } from '@ibm-talent-bridge/shared-types';
import * as createInfra from './infrastructure/processCreate.infra';

export function createWrapper(): ({ children }: { readonly children: ReactNode }) => JSX.Element {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }) {
    return (
      <QueryClientProvider client={client}>
        <MemoryRouter>{children}</MemoryRouter>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(ui: ReactElement): RenderResult {
  return render(ui, { wrapper: createWrapper() });
}

/** Expone la query string actual para asertar sobre la URL. */
export function LocationProbe(): JSX.Element {
  return <output data-testid="search">{useLocation().search}</output>;
}

/** Monta `ui` en `url` con QueryClient propio; incluye `LocationProbe` y una ruta vecina opcional. */
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

/** Candidato de prueba para el asistente de creación. */
export function makeCandidate(index: number): { readonly id: string; readonly fullName: string; readonly primaryRole: string } {
  return { id: `c${index}`, fullName: `Candidato ${index}`, primaryRole: `Rol ${index}` };
}

export function makePage<T>(data: readonly T[], page = 1, totalPages = 1): { data: T[]; total: number; page: number; limit: number; totalPages: number } {
  return { data: [...data], total: data.length, page, limit: 20, totalPages };
}

/** Campos de la oportunidad (PROC-1c) válidos, para fixtures de proceso y borrador del asistente. */
export const OPPORTUNITY_FIXTURE = {
  opportunityRole: 'Backend Java',
  skills: ['Java', 'Spring'],
  roleDescription: 'Evaluar diseño de APIs.',
  band: 8,
} as const;

/** Rellena los 4 campos de la oportunidad del paso 1 con `OPPORTUNITY_FIXTURE` (rol, 2 skills, banda 8, descripción). */
export async function fillOpportunity(user: UserEvent): Promise<void> {
  await user.type(screen.getByLabelText('Rol de la oportunidad *'), OPPORTUNITY_FIXTURE.opportunityRole);
  for (const skill of OPPORTUNITY_FIXTURE.skills) await user.type(screen.getByLabelText('Stack tecnológico *'), `${skill}{Enter}`);
  await user.click(screen.getByRole('radio', { name: 'Banda 8' }));
  await user.type(screen.getByLabelText('Expectativas de evaluación técnica *'), OPPORTUNITY_FIXTURE.roleDescription);
}

/** Respuesta exacta de `GET /processes/limits` del backend; ningún test repite estos números. */
export const LIMITS_FIXTURE: IProcessLimits = {
  maxCandidates: 5,
  opportunity: { roleMax: 200, descriptionMax: 2000, skillsMin: 1, skillsMax: 15, skillMax: 60, bandMin: 6, bandMax: 10 },
  technicalRefsMax: 2,
  terminalStatuses: ['closed', 'cancelled'],
};

/** `LIMITS_FIXTURE` con cambios puntuales (p. ej. `skillsMax: 3`) para probar que el comportamiento sale del servidor. */
export function makeLimits(overrides: Partial<Omit<IProcessLimits, 'opportunity'>> & { readonly opportunity?: Partial<IProcessLimits['opportunity']> } = {}): IProcessLimits {
  return { ...LIMITS_FIXTURE, ...overrides, opportunity: { ...LIMITS_FIXTURE.opportunity, ...overrides.opportunity } };
}

/** Requiere `vi.mock('.../processCreate.infra')` en el test que lo usa. */
export function mockProcessLimits(overrides: Parameters<typeof makeLimits>[0] = {}): void {
  vi.mocked(createInfra.fetchProcessLimits).mockResolvedValue(makeLimits(overrides));
}
