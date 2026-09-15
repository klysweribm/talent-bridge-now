import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // ─── COLORES — Design tokens del DESIGN.md ───────────────────────
      colors: {
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
      },

      // ─── TIPOGRAFÍA ───────────────────────────────────────────────────
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl':  ['42px', { lineHeight: '50px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '30px', fontWeight: '500' }],
        'headline-sm': ['20px', { lineHeight: '26px', fontWeight: '600' }],
        'title-md':    ['16px', { lineHeight: '22px', fontWeight: '600' }],
        'body-lg':     ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-md':     ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-md-medium': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-md':    ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        'label-sm':    ['11px', { lineHeight: '14px', letterSpacing: '0.02em', fontWeight: '400' }],
      },

      // ─── SPACING — 8px rhythm ────────────────────────────────────────
      spacing: {
        '2xs':  '0.125rem',
        'xs':   '0.25rem',
        'sm':   '0.5rem',
        'md':   '0.75rem',
        'base': '1rem',
        'lg':   '1.5rem',
        'xl':   '2rem',
        '2xl':  '3rem',
        '3xl':  '4rem',
      },

      // ─── BORDER RADIUS ───────────────────────────────────────────────
      borderRadius: {
        sm:   '0.125rem',
        DEFAULT: '0.25rem',
        md:   '0.375rem',
        lg:   '0.5rem',
        xl:   '0.75rem',
        full: '9999px',
      },

      // ─── SHADOWS — Carbon style ──────────────────────────────────────
      boxShadow: {
        'raised':  '0 4px 8px 0 rgba(0,0,0,0.10)',
        'modal':   '0 12px 24px 0 rgba(0,0,0,0.16)',
      },
    },
  },
  plugins: [],
};

export default config;
