/**
 * nav-icon-paths — íconos de navegación (`shared/config/navigation.ts`) y de
 * estado (`ComingSoon`). Separado de `icon-paths.ts` solo para no exceder el
 * límite de líneas de ese módulo — mismo contrato (`ISvgIconDef`).
 */
import { STROKE_DEFAULTS, type ISvgIconDef } from './icon-paths';

export const NAV_ICON_DEFS: Readonly<Record<string, ISvgIconDef>> = {
  dashboard: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'rect', attrs: { x: 3, y: 3, width: 7, height: 7 } },
      { tag: 'rect', attrs: { x: 14, y: 3, width: 7, height: 7 } },
      { tag: 'rect', attrs: { x: 14, y: 14, width: 7, height: 7 } },
      { tag: 'rect', attrs: { x: 3, y: 14, width: 7, height: 7 } },
    ],
  },
  processes: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'path', attrs: { d: 'M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z' } },
      { tag: 'path', attrs: { d: 'M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16' } },
    ],
  },
  bench: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'path', attrs: { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' } },
      { tag: 'circle', attrs: { cx: 9, cy: 7, r: 4 } },
      { tag: 'path', attrs: { d: 'M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' } },
    ],
  },
  candidates: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'path', attrs: { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' } },
      { tag: 'circle', attrs: { cx: 12, cy: 7, r: 4 } },
    ],
  },
  referents: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'path', attrs: { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' } },
      { tag: 'circle', attrs: { cx: 9, cy: 7, r: 4 } },
      { tag: 'path', attrs: { d: 'M23 21v-2a4 4 0 0 0-3-3.87' } },
      { tag: 'path', attrs: { d: 'M16 3.13a4 4 0 0 1 0 7.75' } },
    ],
  },
  reports: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'line', attrs: { x1: 18, y1: 20, x2: 18, y2: 10 } },
      { tag: 'line', attrs: { x1: 12, y1: 20, x2: 12, y2: 4 } },
      { tag: 'line', attrs: { x1: 6, y1: 20, x2: 6, y2: 14 } },
    ],
  },
  interviews: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'rect', attrs: { x: 3, y: 4, width: 18, height: 18, rx: 2 } },
      { tag: 'path', attrs: { d: 'M16 2v4M8 2v4M3 10h18' } },
    ],
  },
  feedback: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [{ tag: 'path', attrs: { d: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' } }],
  },
  config: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'circle', attrs: { cx: 12, cy: 12, r: 3 } },
      { tag: 'path', attrs: { d: 'M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42' } },
    ],
  },
  construction: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'rect', attrs: { x: 2, y: 6, width: 20, height: 8, rx: 1 } },
      { tag: 'path', attrs: { d: 'M17 14v7M7 14v7M17 3v3M7 3v3M10 14 2.3 21.7M14 14l7.7 7.7' } },
    ],
  },
  logout: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'path', attrs: { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' } },
      { tag: 'path', attrs: { d: 'M16 17l5-5-5-5' } },
      { tag: 'path', attrs: { d: 'M21 12H9' } },
    ],
  },
  chevron_left: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'path', attrs: { d: 'M15 18l-6-6 6-6' } },
    ],
  },
} as const;
