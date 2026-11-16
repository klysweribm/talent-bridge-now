/** icon-registry — unión de todos los mapas de iconos SVG inline que resuelve `Icon`. */
import { DETAIL_ICON_DEFS } from './detail-icon-paths';
import { HEADER_ICON_DEFS } from './header-icon-paths';
import { AUTH_ICON_DEFS, type ISvgIconDef } from './icon-paths';
import { NAV_ICON_DEFS } from './nav-icon-paths';
import { SIDEBAR_ICON_DEFS } from './sidebar-icon-paths';
import { STATUS_ICON_DEFS } from './status-icon-paths';

export const SVG_ICON_DEFS: Readonly<Record<string, ISvgIconDef>> = {
  ...AUTH_ICON_DEFS, ...NAV_ICON_DEFS, ...DETAIL_ICON_DEFS, ...HEADER_ICON_DEFS, ...SIDEBAR_ICON_DEFS, ...STATUS_ICON_DEFS,
};
