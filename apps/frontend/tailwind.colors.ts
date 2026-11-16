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
    placeholder: '#a8a8a8',
    on:        '#1a1c1c',
    'on-variant': '#434655',
  },
  outline: {
    DEFAULT:   '#747686',
    variant:   '#c4c5d7',
    field:     '#8d8d8d',
  },
  // Azules de marca oscuros para el panel del login (texto claro sobre ellos: contraste > 7:1).
  brand: {
    deep:      '#001141',
    mid:       '#001d6c',
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
    'success-text': '#0e6027',
    'purple-bg':  '#f6f2ff',
    'purple-text': '#6929c4',
  },
  // Fondos de velo (scrim) tras paneles y diálogos.
  scrim: { DEFAULT: 'rgba(22,22,22,0.5)', light: 'rgba(22,22,22,0.3)' },
  error: {
    DEFAULT:   '#ba1a1a',
    container: '#ffdad6',
    'on-container': '#93000a',
    on:        '#ffffff',
  },
  // Paleta Carbon g10 (rediseño IBM Future Now): fuente única de los valores de marca.
  carbon: {
    'gray-10': '#f4f4f4', 'gray-20': '#e0e0e0', 'gray-30': '#c6c6c6', 'gray-50': '#8d8d8d',
    'gray-60': '#6f6f6f', 'gray-70': '#525252', 'gray-80': '#393939', 'gray-100': '#161616',
    'gray-hover': '#e8e8e8', 'gray-hover-2': '#2e2e2e', 'gray-80-hover': '#474747',
    'blue-10': '#edf5ff', 'blue-20': '#d0e2ff', 'blue-30': '#a6c8ff', 'blue-60': '#0f62fe',
    'blue-60-hover': '#0050e6', 'blue-70': '#0043ce', 'blue-80': '#002d9c',
    'red-10': '#fff1f1', red: '#da1e28', 'red-hover': '#b81921',
    green: '#24a148', 'green-tag-bg': '#a7f0ba', 'green-tag-text': '#0e6027', 'green-toast': '#defbe6',
    yellow: '#f1c21b', 'yellow-tag-bg': '#fcf4d6', 'yellow-tag-text': '#483700', 'yellow-dot': '#b28600', 'yellow-ring': 'rgba(177,142,0,0.3)',
    'chart-purple': '#6929c4', 'chart-cyan': '#1192e8', 'chart-teal': '#005d5d',
  },
} as const;
