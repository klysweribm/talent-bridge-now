import type { UserRole } from '@ibm-talent-bridge/shared-types';

/**
 * navigation — única fuente de verdad de la navegación autenticada.
 * `router/AppRouter.tsx` y `shared/layouts/SidebarNav.tsx` consumen este
 * mismo arreglo: ningún link de sidebar puede quedar sin ruta y los roles
 * permitidos no pueden divergir entre el menú y el guard de la ruta.
 *
 * Roles derivados de PROJECT_CONTEXT.md → "Roles del MVP":
 * - Reclutador: crea procesos, busca referentes, sube CVs, agenda
 *   entrevistas, genera reportes.
 * - Referente Técnico: carga disponibilidad, aprueba citas, llena feedback
 *   post-entrevista.
 * - PM: vista ejecutiva de lectura, descarga reportes.
 */
export interface INavItem {
  readonly path:        string;
  readonly label:       string;
  readonly mobileLabel: string;
  readonly icon:        string;
  readonly roles:       readonly UserRole[];
}

export const NAVIGATION_ITEMS: readonly INavItem[] = [
  { path: '/dashboard',  label: 'Inicio',                   mobileLabel: 'Inicio',     icon: 'dashboard',  roles: ['recruiter', 'pm', 'technical_ref'] },
  { path: '/processes',  label: 'Procesos de Selección',    mobileLabel: 'Procesos',   icon: 'processes',  roles: ['recruiter', 'pm'] },
  { path: '/candidates', label: 'Candidatos',               mobileLabel: 'Candidatos', icon: 'candidates', roles: ['recruiter', 'pm'] },
  { path: '/referents',  label: 'Buscar Referentes',        mobileLabel: 'Referentes', icon: 'referents',  roles: ['recruiter'] },
  { path: '/reports',    label: 'Reportes',                 mobileLabel: 'Reportes',   icon: 'reports',    roles: ['recruiter', 'pm'] },
  { path: '/interviews', label: 'Entrevistas',               mobileLabel: 'Agenda',     icon: 'interviews', roles: ['recruiter', 'technical_ref'] },
  { path: '/feedback',   label: 'Feedback',                 mobileLabel: 'Feedback',   icon: 'feedback',   roles: ['technical_ref'] },
  { path: '/config',     label: 'Configuración',            mobileLabel: 'Config',     icon: 'config',     roles: ['recruiter', 'pm', 'technical_ref'] },
] as const;

/** Rutas protegidas que aún no tienen pantalla real — renderizan `ComingSoon`. */
export const COMING_SOON_PATHS: readonly string[] = [
  '/processes',
  '/processes/new',
  '/processes/:id',
  '/candidates',
  '/interviews',
  '/feedback',
  '/reports',
  '/referents',
  '/config',
] as const;
