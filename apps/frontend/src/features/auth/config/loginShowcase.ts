/**
 * loginShowcase — CONTENIDO DECORATIVO DE MAQUETA del panel izquierdo del login.
 * Nada de esto viene de datos reales ni de un backend: la persona, las cifras
 * y las insignias son ilustrativas. No usar como fuente de información.
 */
export const LOGIN_SHOWCASE = {
  label:        'CONSULTING',
  cloudPill:    'Global Talent Cloud',
  eyebrow:      'Plataforma de Talento Estratégico',
  headlineLead: 'Conectando el mejor talento tecnológico con el futuro de',
  headlineEm:   'IBM Consulting.',
  profile: {
    name:     'Elena Morales',
    role:     'Talent Lead LATAM',
    badge:    'IBM VERIFIED',
    initials: 'EM',
  },
  stats: [
    { value: '94%',    delta: '+4.2%', caption: 'Coincidencia técnica promedio' },
    { value: '+1,200', delta: null,    caption: 'Procesos 2024' },
  ],
  poweredBy: 'Impulsado por IBM Watson Orchestrate & Carbon Design',
  guard:     'Enterprise Auth Guard • 256-bit',
} as const;
