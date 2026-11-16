import type { Config } from 'tailwindcss';
import { colors } from './tailwind.colors';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors,

      // ─── TIPOGRAFÍA ───────────────────────────────────────────────────
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // Escala Future Now
        kpi:  ['42px', { lineHeight: '50px', fontWeight: '300' }],
        h1:   ['32px', { lineHeight: '40px', fontWeight: '300' }],
        h2:   ['16px', { lineHeight: '22px', fontWeight: '600' }],
        h3:   ['20px', { lineHeight: '28px', fontWeight: '400' }],
        body: ['14px', { lineHeight: '20px', letterSpacing: '0.16px' }],
        'body-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.32px' }],
        label: ['12px', { lineHeight: '16px', letterSpacing: '0.32px' }],
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
        header:  '48px',
        sidebar: '256px',
      },

      // ─── BORDER RADIUS ───────────────────────────────────────────────
      borderRadius: {
        sm:   '0.125rem',
        DEFAULT: '0.25rem',
        md:   '0.375rem',
        lg:   '0.5rem',
        xl:   '0.75rem',
        pill: '12px',
        full: '9999px',
      },

      // ─── SHADOWS — Carbon style ──────────────────────────────────────
      boxShadow: {
        'raised':  '0 4px 8px 0 rgba(0,0,0,0.10)',
        'modal':   '0 12px 24px 0 rgba(0,0,0,0.16)',
        'overlay': '0 2px 6px rgba(0,0,0,.2)',
        'panel':   '0 2px 12px rgba(0,0,0,.25)',
      },

      // ─── LAYOUT — header/sidebar y anchos máximos de contenido ───────
      height:   { header: '48px' },
      width:    { sidebar: '256px', panel: '400px' },
      zIndex:   { sidebar: '40', 'drawer-scrim': '45', drawer: '50', scrim: '55', panel: '58', header: '60', toast: '80', modal: '90' },
      maxWidth: { 'content-max': '1584px', 'content-wide': '1920px', 'content-narrow': '1312px' },

      // ─── ANIMACIÓN — barra de progreso indeterminada ────────────────
      keyframes: {
        'progress-indeterminate': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(250%)' },
        },
      },
      animation: {
        'progress-indeterminate': 'progress-indeterminate 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
