/**
 * tailwind.colors — paleta de colores (design tokens del DESIGN.md).
 * Extraído de `tailwind.config.ts` para mantenerlo bajo el límite de líneas.
 */
export const colors = {
  surface: {
    DEFAULT:   '#f9f9f9',
    dim:       '#dadada',
    bright:    '#f9f9f9',
    card:      '#ffffff',
    lowest:    '#ffffff',
    low:       '#f3f3f3',
    base:      '#eeeeee',
    high:      '#e8e8e8',
    highest:   '#e2e2e2',
    variant:   '#e2e2e2',
    tint:      '#1f51da',
  },
  primary: {
    DEFAULT:   '#003099',
    container: '#0043ce',
    fixed:     '#dce1ff',
    'fixed-dim': '#b7c4ff',
    on:        '#ffffff',
    'on-container': '#b6c3ff',
    'on-fixed': '#001551',
    'on-fixed-variant': '#0039b4',
    inverse:   '#b7c4ff',
    interactive: '#0f62fe',
  },
  secondary: {
    DEFAULT:   '#004ccd',
    container: '#0f62fe',
    fixed:     '#dbe1ff',
    'fixed-dim': '#b4c5ff',
    on:        '#ffffff',
    'on-container': '#f3f3ff',
    'on-fixed': '#00174c',
    'on-fixed-variant': '#003da9',
  },
  text: {
    primary:   '#161616',
    secondary: '#525252',
    on:        '#1a1c1c',
    'on-variant': '#434655',
  },
  outline: {
    DEFAULT:   '#747686',
    variant:   '#c4c5d7',
  },
  status: {
    success:   '#24a148',
    warning:   '#f1c21b',
    danger:    '#da1e28',
    'success-bg': '#defbe6',
    'warning-bg': '#fef3d6',
    'danger-bg':  '#ffebeb',
    'info-bg':    '#edf5ff',
    'info-text':  '#0043ce',
  },
  error: {
    DEFAULT:   '#ba1a1a',
    container: '#ffdad6',
    'on-container': '#93000a',
    on:        '#ffffff',
  },
} as const;
