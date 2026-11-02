import { render, screen, type RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactElement, ReactNode } from 'react';

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
