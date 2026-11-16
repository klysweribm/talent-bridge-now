/**
 * status-icon-paths — iconos de estado del prototipo Future Now (check, triángulo de
 * advertencia, info). Rellenos con `currentColor`; el glifo interior usa trazo blanco/oscuro fijo del prototipo.
 */
import type { ISvgIconDef } from './icon-paths';

const FILLED = { fill: 'currentColor', viewBox: '0 0 16 16' } as const;

export const STATUS_ICON_DEFS: Readonly<Record<string, ISvgIconDef>> = {
  'status-check': {
    ...FILLED,
    children: [
      { tag: 'circle', attrs: { cx: 8, cy: 8, r: 7.5 } },
      { tag: 'path', attrs: { d: 'M4.5 8l2.3 2.3L11.5 5.7', fill: 'none', stroke: '#fff', strokeWidth: 1.5 } },
    ],
  },
  'status-warning': {
    ...FILLED,
    children: [
      { tag: 'path', attrs: { d: 'M8 1.5L15 14.5H1z' } },
      { tag: 'path', attrs: { d: 'M8 6v4M8 11.3v1.4', fill: 'none', stroke: '#161616', strokeWidth: 1.4 } },
    ],
  },
  'status-info': {
    ...FILLED,
    children: [
      { tag: 'circle', attrs: { cx: 8, cy: 8, r: 7.5 } },
      { tag: 'path', attrs: { d: 'M8 7v4.5M8 4.3v1.4', fill: 'none', stroke: '#fff', strokeWidth: 1.4 } },
    ],
  },
};
