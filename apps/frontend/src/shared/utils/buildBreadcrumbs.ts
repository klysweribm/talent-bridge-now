import { NAVIGATION_ITEMS } from '@shared/config/navigation';

export interface IBreadcrumb {
  readonly label: string;
  readonly to?:   string;
}

const HOME_PATH = '/dashboard';
const NEW_SEGMENT_LABEL = 'Nuevo proceso';
const DETAIL_SEGMENT_LABEL = 'Detalle del proceso';

/**
 * Deriva el breadcrumb desde la URL. La sección sale de `NAVIGATION_ITEMS`
 * (misma fuente que el menú); el segundo nivel solo existe bajo /processes.
 */
export function buildBreadcrumbs(pathname: string): readonly IBreadcrumb[] {
  const [section, child] = pathname.split('/').filter(Boolean);
  const sectionPath = `/${section ?? ''}`;
  const item = NAVIGATION_ITEMS.find(nav => nav.path === sectionPath);
  if (!item) return [];
  if (item.path === HOME_PATH) return [{ label: item.label }];

  const home = NAVIGATION_ITEMS.find(nav => nav.path === HOME_PATH);
  const trail: IBreadcrumb[] = home ? [{ label: home.label, to: home.path }] : [];
  if (!child) return [...trail, { label: item.label }];

  const childLabel = child === 'new' ? NEW_SEGMENT_LABEL : DETAIL_SEGMENT_LABEL;
  return [...trail, { label: item.label, to: item.path }, { label: childLabel }];
}
