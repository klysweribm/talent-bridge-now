import type { ProcessStage, SeniorityLevel, InterviewDuration } from '@ibm-talent-bridge/shared-types';

// ─── Date / Time Formatters ───────────────────────────────────────────────────

/**
 * Formatea una fecha ISO a formato legible en español.
 * Ej: "2025-06-15T14:30:00Z" → "15 jun. 2025, 14:30"
 */
export const formatDateEs = (isoDate: string, timezone?: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone ?? 'America/Mexico_City',
  }).format(date);
};

/**
 * Formatea solo la fecha (sin hora).
 * Ej: "2025-06-15" → "15 de junio de 2025"
 */
export const formatDateOnlyEs = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
};

/**
 * Devuelve una etiqueta relativa de tiempo en español.
 * Ej: "Hoy, 14:30" | "Ayer" | "Hace 3 días"
 */
export const formatRelativeTimeEs = (isoDate: string): string => {
  const now = new Date();
  const date = new Date(isoDate);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const time = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(date);
    return `Hoy, ${time}`;
  }
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  return formatDateOnlyEs(isoDate);
};

// ─── Stage Formatters ─────────────────────────────────────────────────────────

const STAGE_LABELS: Readonly<Record<ProcessStage, string>> = {
  initial: 'Inicial',
  first_interview: '1ra Entrevista',
  technical_interview: 'Entrevista Técnica',
  client_interview: 'C/Cliente',
  closure: 'Cierre',
  feedback: 'Retroalimentación',
} as const;

export const formatStageLabel = (stage: ProcessStage): string =>
  STAGE_LABELS[stage];

/** Colores de chip por etapa — coinciden exactamente con el design system */
export const STAGE_CHIP_COLORS: Readonly<Record<ProcessStage, { bg: string; text: string }>> = {
  initial:              { bg: '#E2E2E2', text: '#434655' },
  first_interview:      { bg: '#DBEAFE', text: '#1E40AF' },
  technical_interview:  { bg: '#F3E8FF', text: '#6B21A8' },
  client_interview:     { bg: '#FFEDD5', text: '#9A3412' },
  closure:              { bg: '#DEFBE6', text: '#24A148' },
  feedback:             { bg: '#EDF5FF', text: '#0043CE' },
} as const;

// ─── Seniority Formatters ─────────────────────────────────────────────────────

const SENIORITY_LABELS: Readonly<Record<SeniorityLevel, string>> = {
  junior:    'Junior',
  mid:       'Mid',
  senior:    'Senior',
  lead:      'Lead',
  architect: 'Architect',
} as const;

export const formatSeniorityLabel = (level: SeniorityLevel): string =>
  SENIORITY_LABELS[level];

// ─── Interview Duration Formatters ────────────────────────────────────────────

export const formatDurationLabel = (duration: InterviewDuration): string => {
  const labels: Readonly<Record<InterviewDuration, string>> = {
    30: '30 min',
    45: '45 min',
    60: '60 min (Recomendado IBM Consulting)',
    90: '90 min (Caso Práctico Completo)',
  } as const;
  return labels[duration];
};

// ─── Email Validators ─────────────────────────────────────────────────────────

/** Valida que el correo sea un @ibm.com válido */
export const isIbmCorporateEmail = (email: string): boolean =>
  /^[a-zA-Z0-9._%+-]+@ibm\.com$/.test(email.trim().toLowerCase());

// ─── String Utils ─────────────────────────────────────────────────────────────

/** Genera iniciales a partir de un nombre completo. Ej: "Martín Rivas" → "MR" */
export const getInitials = (fullName: string): string =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');

/** Trunca un texto a maxLength caracteres añadiendo "..." */
export const truncateText = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.slice(0, maxLength - 3)}...`;

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  readonly page: number;
  readonly limit: number;
}

export const buildPaginationParams = (
  page = 1,
  limit = 20,
): PaginationParams => ({
  page: Math.max(1, page),
  limit: Math.min(100, Math.max(1, limit)),
});

export const calcSkip = ({ page, limit }: PaginationParams): number =>
  (page - 1) * limit;

export const calcTotalPages = (total: number, limit: number): number =>
  Math.ceil(total / limit);
