import type { ConfigService } from '@nestjs/config';

const PRODUCTION_ENV = 'production';
const ENABLED_VALUE = 'true';

/**
 * Falla cerrado: el login de desarrollo y el seed de usuarios demo solo existen
 * si `AUTH_DEV_LOGIN_ENABLED=true` explícito. Una variable ausente o mal escrita
 * los apaga, y `NODE_ENV=production` los apaga aunque el flag diga `true`.
 */
export function isDevLoginEnabled(configService: Pick<ConfigService, 'get'>): boolean {
  return (
    configService.get<string>('NODE_ENV') !== PRODUCTION_ENV &&
    configService.get<string>('AUTH_DEV_LOGIN_ENABLED') === ENABLED_VALUE
  );
}
