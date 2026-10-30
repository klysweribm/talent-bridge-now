import type { ConfigService } from '@nestjs/config';

const DEFAULT_RETENTION_DAYS = 90;
const SECONDS_PER_DAY = 86_400;

/** Segundos de retención de `auth_events`, desde AUTH_EVENT_RETENTION_DAYS (entero > 0; si no, 90 días). */
export function authEventRetentionSeconds(configService: ConfigService): number {
  const raw = Number(configService.get<string>('AUTH_EVENT_RETENTION_DAYS'));
  const days = Number.isInteger(raw) && raw > 0 ? raw : DEFAULT_RETENTION_DAYS;
  return days * SECONDS_PER_DAY;
}
