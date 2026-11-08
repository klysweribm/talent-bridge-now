import type { ReactElement } from 'react';
import { ComingSoon } from '@shared/components/organisms/ComingSoon';
import { NAVIGATION_ITEMS } from '@shared/config/navigation';
import type { UserRole } from '@features/auth/store/auth.store';
import { BenchPage } from '@features/bench/components/pages/BenchPage';
import { CandidatesPage } from '@features/candidates/components/pages/CandidatesPage/CandidatesPage';
import { NewCandidatePage } from '@features/candidates/components/pages/NewCandidatePage';
import { DashboardPage } from '@features/processes/components/pages/DashboardPage';
import { ProcessDetailPage } from '@features/processes/components/pages/ProcessDetailPage/ProcessDetailPage';
import { ProcessesPage } from '@features/processes/components/pages/ProcessesPage/ProcessesPage';
import { NewProcessPage } from '@features/processes/components/pages/NewProcessPage';
import { BENCH_PATH, CANDIDATES_NEW_PATH, CANDIDATES_PATH, DASHBOARD_PATH, NEW_PROCESS_PATH, PROCESSES_PATH } from './paths';

export interface IRouteConfig {
  readonly path:    string;
  readonly label:   string;
  readonly roles:   readonly UserRole[];
  readonly element: ReactElement;
}

export interface IRoleGroup {
  readonly roles:  readonly UserRole[];
  readonly routes: readonly IRouteConfig[];
}

const PROCESSES_ROLES: readonly UserRole[] =
  NAVIGATION_ITEMS.find(item => item.path === PROCESSES_PATH)?.roles ?? [];

// Rutas protegidas sin item de sidebar: mismos roles que /processes, sin pantalla real aún.
const EXTRA_ROUTES: readonly Omit<IRouteConfig, 'element'>[] = [
  { path: NEW_PROCESS_PATH,       label: 'Nueva oportunidad',       roles: PROCESSES_ROLES },
  { path: `${PROCESSES_PATH}/:id`, label: 'Detalle de la oportunidad', roles: PROCESSES_ROLES },
  // CAND-2: alta de candidato; sin item de sidebar (el bottom-nav del reclutador ya tiene 5).
  { path: CANDIDATES_NEW_PATH,    label: 'Agregar candidato',   roles: PROCESSES_ROLES },
];

// Pantallas reales por ruta; todo lo demás cae en ComingSoon.
const REAL_PAGES: Readonly<Record<string, ReactElement>> = {
  [DASHBOARD_PATH]: <DashboardPage />,
  [BENCH_PATH]:     <BenchPage />,
  [PROCESSES_PATH]:       <ProcessesPage />,
  [`${PROCESSES_PATH}/:id`]: <ProcessDetailPage />,
  [NEW_PROCESS_PATH]:     <NewProcessPage />,
  [CANDIDATES_PATH]:      <CandidatesPage />,
  [CANDIDATES_NEW_PATH]:  <NewCandidatePage />,
};

const toRoute = (route: Omit<IRouteConfig, 'element'>): IRouteConfig => ({
  ...route,
  element: REAL_PAGES[route.path] ?? <ComingSoon label={route.label} />,
});

export const PROTECTED_ROUTES: readonly IRouteConfig[] =
  [...NAVIGATION_ITEMS, ...EXTRA_ROUTES].map(toRoute);

const rolesKey = (roles: readonly UserRole[]): string => [...roles].sort().join(',');

/** Rutas agrupadas por conjunto de roles: un `RoleRoute` por grupo, no por ruta. */
export const ROLE_GROUPS: readonly IRoleGroup[] = Array.from(
  PROTECTED_ROUTES.reduce((groups, route) => {
    const key = rolesKey(route.roles);
    const group = groups.get(key);
    return groups.set(key, { roles: route.roles, routes: [...(group?.routes ?? []), route] });
  }, new Map<string, IRoleGroup>()).values(),
);
