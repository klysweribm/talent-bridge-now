/**
 * icon-paths — datos puros de los SVG inline usados como fallback por `Icon`.
 * Extraído de `Icon.tsx` (DT-003) para mantener el componente bajo el límite
 * de líneas de un atom. Sin JSX a propósito: `Icon.tsx` renderiza esta data
 * con `React.createElement`, así este archivo no cuenta como `.tsx` de atom.
 *
 * Los íconos de navegación/estado viven en `nav-icon-paths.ts` (archivo
 * separado solo para no exceder el límite de líneas de este módulo).
 */

export type TSvgChildTag = 'path' | 'rect' | 'circle' | 'line';

export interface ISvgChildDef {
  readonly tag:   TSvgChildTag;
  readonly attrs: Readonly<Record<string, string | number>>;
}

export interface ISvgIconDef {
  readonly viewBox:        string;
  readonly fill:           string;
  readonly stroke?:        string;
  readonly strokeWidth?:   number;
  readonly strokeLinecap?: 'round';
  readonly strokeLinejoin?: 'round';
  readonly children:       readonly ISvgChildDef[];
}

export const STROKE_DEFAULTS = {
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.8,
  strokeLinecap: 'round', strokeLinejoin: 'round',
} as const;

export const AUTH_ICON_DEFS: Readonly<Record<string, ISvgIconDef>> = {
  mail: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'rect', attrs: { x: 2, y: 4, width: 20, height: 16, rx: 2 } },
      { tag: 'path', attrs: { d: 'm22 7-10 7L2 7' } },
    ],
  },
  lock: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'rect', attrs: { x: 3, y: 11, width: 18, height: 11, rx: 2 } },
      { tag: 'path', attrs: { d: 'M7 11V7a5 5 0 0 1 10 0v4' } },
    ],
  },
  visibility: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'path', attrs: { d: 'M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z' } },
      { tag: 'circle', attrs: { cx: 12, cy: 12, r: 3 } },
    ],
  },
  visibility_off: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'path', attrs: { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94' } },
      { tag: 'path', attrs: { d: 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19' } },
      { tag: 'line', attrs: { x1: 1, y1: 1, x2: 23, y2: 23 } },
    ],
  },
  psychology: {
    fill: 'currentColor', viewBox: '0 0 24 24',
    children: [{ tag: 'path', attrs: { d: 'M13 2c-3.87 0-7 3.13-7 7 0 2.45 1.27 4.6 3.19 5.87L9 17h6l-.19-2.13C16.73 13.6 18 11.45 18 9c0-3.87-3.13-7-5-7zm-1 13h2v2h-2zm0 4h2v2h-2zm4.5-9H13V8h-2v2H7.5C7.22 10 7 9.78 7 9.5v-1C7 6.57 8.57 5 10.5 5h3C15.43 5 17 6.57 17 8.5v1c0 .28-.22.5-.5.5z' } }],
  },
  verified_user: {
    fill: 'currentColor', viewBox: '0 0 24 24',
    children: [{ tag: 'path', attrs: { d: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z' } }],
  },
  arrow_forward: {
    fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', viewBox: '0 0 24 24',
    children: [{ tag: 'path', attrs: { d: 'M5 12h14M12 5l7 7-7 7' } }],
  },
  lock_open: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'rect', attrs: { x: 3, y: 11, width: 18, height: 11, rx: 2 } },
      { tag: 'path', attrs: { d: 'M7 11V7a5 5 0 0 1 9.9-1' } },
    ],
  },
  error: {
    fill: 'currentColor', viewBox: '0 0 24 24',
    children: [{ tag: 'path', attrs: { d: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z' } }],
  },
  progress_activity: {
    fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', viewBox: '0 0 24 24',
    children: [{ tag: 'path', attrs: { d: 'M12 2a10 10 0 0 1 10 10' } }],
  },
} as const;
