import { STROKE_DEFAULTS, type ISvgIconDef } from './icon-paths';

/** Íconos de la tarjeta de detalle y de los chips removibles (PROC-1c). */
export const DETAIL_ICON_DEFS: Readonly<Record<string, ISvgIconDef>> = {
  close: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [{ tag: 'path', attrs: { d: 'M18 6L6 18M6 6l12 12' } }],
  },
  apartment: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'path', attrs: { d: 'M4 21V4a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v17' } },
      { tag: 'path', attrs: { d: 'M15 9h4a1 1 0 0 1 1 1v11M2 21h20' } },
      { tag: 'path', attrs: { d: 'M8 7h3M8 11h3M8 15h3' } },
    ],
  },
  description: {
    ...STROKE_DEFAULTS, viewBox: '0 0 24 24',
    children: [
      { tag: 'path', attrs: { d: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z' } },
      { tag: 'path', attrs: { d: 'M14 3v5h5M9 13h6M9 17h6' } },
    ],
  },
} as const;
