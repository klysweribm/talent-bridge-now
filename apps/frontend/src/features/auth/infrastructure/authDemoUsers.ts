import type { AuthUser } from '@features/auth/store/auth.store';

/**
 * DEMO_USERS — usuarios sembrados para la demo (QW-1, temporal).
 * Reemplazado por AUTH-1 (login de desarrollo con JWT real contra usuarios
 * sembrados en Mongo) y luego por AUTH-2 (OTP real). Un email @ibm.com que
 * no esté en esta lista se trata como "no provisionado" — mismo mensaje que
 * usará AUTH-2 cuando valide contra la base de usuarios real.
 */
export const DEMO_USERS: readonly AuthUser[] = [
  { id: '1', name: 'Ana García',      email: 'ana@ibm.com',      role: 'recruiter' },
  { id: '2', name: 'Carlos Londoño',  email: 'carlos@ibm.com',   role: 'technical_ref' },
  { id: '3', name: 'Mariana López',   email: 'mariana@ibm.com',  role: 'pm' },
] as const;
