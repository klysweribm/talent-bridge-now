import type { ReactElement } from 'react';
import { ComingSoon } from '@shared/components/organisms/ComingSoon';
import { NAVIGATION_ITEMS } from '@shared/config/navigation';
import type { UserRole } from '@features/auth/store/auth.store';
import { DashboardPage } from '@features/processes/components/pages/DashboardPage';
import { DASHBOARD_PATH, PROCESSES_PATH } from './paths';

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
  { path: `${PROCESSES_PATH}/new`, label: 'Nuevo Proceso',       roles: PROCESSES_ROLES },
  { path: `${PROCESSES_PATH}/:id`, label: 'Detalle del Proceso', roles: PROCESSES_ROLES },
];

const toRoute = (route: Omit<IRouteConfig, 'element'>): IRouteConfig => ({
  ...route,
  element: route.path === DASHBOARD_PATH ? <DashboardPage /> : <ComingSoon label={route.label} />,
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
