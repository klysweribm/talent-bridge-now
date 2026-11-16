/**
 * sidebar-icon-paths — iconos de trazo 16px del sidebar del prototipo Future Now
 * (stroke currentColor, 1.3). Nombres con prefijo `fn-` para no pisar los de `nav-icon-paths.ts`.
 */
import type { ISvgIconDef } from './icon-paths';

const STROKE_13 = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.3, viewBox: '0 0 16 16' } as const;

export const SIDEBAR_ICON_DEFS: Readonly<Record<string, ISvgIconDef>> = {
  'fn-grid': {
    ...STROKE_13,
    children: [
      { tag: 'rect', attrs: { x: 2, y: 2, width: 5, height: 5 } },
      { tag: 'rect', attrs: { x: 9, y: 2, width: 5, height: 5 } },
      { tag: 'rect', attrs: { x: 2, y: 9, width: 5, height: 5 } },
      { tag: 'rect', attrs: { x: 9, y: 9, width: 5, height: 5 } },
    ],
  },
  'fn-people': {
    ...STROKE_13,
    children: [
      { tag: 'circle', attrs: { cx: 6, cy: 5.5, r: 2.5 } },
      { tag: 'path', attrs: { d: 'M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5' } },
      { tag: 'circle', attrs: { cx: 11.5, cy: 5.5, r: 2 } },
      { tag: 'path', attrs: { d: 'M11 9.6c2 .2 3.5 2 3.5 4.4' } },
    ],
  },
  'fn-briefcase': {
    ...STROKE_13,
    children: [
      { tag: 'rect', attrs: { x: 1.5, y: 4.5, width: 13, height: 9 } },
      { tag: 'path', attrs: { d: 'M5.5 4.5V2.5h5v2M1.5 8.5h13' } },
    ],
  },
  'fn-person': {
    ...STROKE_13,
    children: [
      { tag: 'circle', attrs: { cx: 8, cy: 5, r: 3 } },
      { tag: 'path', attrs: { d: 'M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5' } },
    ],
  },
  'fn-bars': { ...STROKE_13, children: [{ tag: 'path', attrs: { d: 'M3 14V9M8 14V3M13 14V6M1.5 14.5h13' } }] },
};
