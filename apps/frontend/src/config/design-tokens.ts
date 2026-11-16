/**
 * Design tokens centralizados — IBM Future Now Portal
 * Fuente de verdad: DESIGN/stitch_ibm_talent_bridge_portal/ibm_talent_bridge/DESIGN.md
 * Estos valores se usan en componentes que necesitan acceso programático
 * (ej: StageChip, StatusBadge con variantes dinámicas).
 */
import type { UserRole } from '@ibm-talent-bridge/shared-types';

// ─── Etapas del proceso de selección ─────────────────────────
export const PROCESS_STAGES = [
  'Inicial',
  '1ra Entrevista',
  'Entrevista Técnica',
  'Entrevista con Cliente',
  'Cierre',
  'Retroalimentación',
] as const;

export type ProcessStage = (typeof PROCESS_STAGES)[number];

// ─── Colores de chips por etapa (clases sobre tokens Carbon, nunca hex) ───
export const STAGE_CHIP_STYLES: Record<
  ProcessStage,
  { classes: string; label: string }
> = {
  'Inicial':                { classes: 'bg-carbon-gray-20 text-carbon-gray-100', label: 'Inicial' },
  '1ra Entrevista':         { classes: 'bg-carbon-blue-20 text-carbon-blue-80', label: '1ra Entrevista' },
  'Entrevista Técnica':     { classes: 'bg-status-purple-bg text-status-purple-text', label: 'Entrevista Técnica' },
  'Entrevista con Cliente': { classes: 'bg-carbon-yellow-tag-bg text-carbon-yellow-tag-text', label: 'Con Cliente' },
  'Cierre':                 { classes: 'bg-carbon-green-tag-bg text-carbon-green-tag-text', label: 'Cierre' },
  'Retroalimentación':      { classes: 'bg-carbon-red-10 text-carbon-red', label: 'Retroalimentación' },
} as const;

// ─── Roles del sistema ──────────────────────────────────────────
// Fuente única: `UserRole` de `@ibm-talent-bridge/shared-types` — no se
// redefine aquí para evitar un segundo enum de roles (anti-hardcoding).
export const ROLE_LABELS: Record<UserRole, string> = {
  recruiter:     'Reclutador',
  technical_ref: 'Referente Técnico',
  pm:            'Project Manager',
} as const;

// ─── Duraciones de entrevista (minutos) ──────────────────────
export const INTERVIEW_DURATIONS = [30, 45, 60, 90] as const;
export type InterviewDuration = (typeof INTERVIEW_DURATIONS)[number];

// ─── Bloques horarios disponibles ────────────────────────────
export const TIME_BLOCKS = {
  morning: { label: 'Mañana',  start: '09:00', end: '13:00' },
  evening: { label: 'Tarde',   start: '14:00', end: '18:00' },
} as const;

export type TimeBlock = keyof typeof TIME_BLOCKS;

// ─── Tokens de color planos (para uso en sx / style prop) ────
export const COLORS = {
  primary:             '#003099',
  primaryContainer:    '#0043ce',
  primaryInteractive:  '#0f62fe',
  surface:             '#f9f9f9',
  surfaceCard:         '#ffffff',
  textPrimary:         '#161616',
  textSecondary:       '#525252',
  outline:             '#747686',
  outlineVariant:      '#c4c5d7',
  borderCard:          '#e0e0e0',
  statusSuccess:       '#24a148',
  statusWarning:       '#f1c21b',
  statusDanger:        '#da1e28',
  statusSuccessBg:     '#defbe6',
  statusWarningBg:     '#fef3d6',
  statusDangerBg:      '#ffebeb',
  statusInfoBg:        '#edf5ff',
  statusInfoText:      '#0043ce',
} as const;
