import { ENV } from '@/config/env';

/** Tope validado en el cliente; el backend es la autoridad. */
export const OPPORTUNITY_SOURCE_MAX_FILE_BYTES = ENV.VITE_OPPORTUNITY_SOURCE_MAX_FILE_BYTES;

/** Lista cerrada de brochures: PDF, DOCX, Markdown y texto plano. */
export const OPPORTUNITY_SOURCE_EXTENSIONS = ['.pdf', '.docx', '.md', '.txt'] as const;
export const OPPORTUNITY_SOURCE_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'text/plain',
] as const;
export const OPPORTUNITY_SOURCE_ACCEPT = [...OPPORTUNITY_SOURCE_EXTENSIONS, ...OPPORTUNITY_SOURCE_MIME_TYPES].join(',');
