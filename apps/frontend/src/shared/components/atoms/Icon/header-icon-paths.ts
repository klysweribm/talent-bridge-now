/**
 * header-icon-paths — iconos de trazo del header del prototipo Future Now
 * (stroke currentColor, 1.5). Mismo contrato `ISvgIconDef` que `icon-paths.ts`.
 */
import type { ISvgIconDef } from './icon-paths';

const STROKE_15 = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 } as const;

export const HEADER_ICON_DEFS: Readonly<Record<string, ISvgIconDef>> = {
  search: {
    ...STROKE_15, viewBox: '0 0 20 20',
    children: [
      { tag: 'circle', attrs: { cx: 8.5, cy: 8.5, r: 5.5 } },
      { tag: 'path', attrs: { d: 'M12.5 12.5L17 17' } },
    ],
  },
  bell: {
    ...STROKE_15, viewBox: '0 0 20 20',
    children: [
      { tag: 'path', attrs: { d: 'M5 14V9a5 5 0 0110 0v5l1.5 2h-13z' } },
      { tag: 'path', attrs: { d: 'M8 17.5a2 2 0 004 0' } },
    ],
  },
  'chevron-down': { ...STROKE_15, viewBox: '0 0 16 16', children: [{ tag: 'path', attrs: { d: 'M4 6l4 4 4-4' } }] },
  'chevron-right': { ...STROKE_15, viewBox: '0 0 16 16', children: [{ tag: 'path', attrs: { d: 'M6 4l4 4-4 4' } }] },
  'chevron-left': { ...STROKE_15, viewBox: '0 0 16 16', children: [{ tag: 'path', attrs: { d: 'M10 4l-4 4 4 4' } }] },
};
