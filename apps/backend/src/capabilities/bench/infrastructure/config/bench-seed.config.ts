import type { ConfigService } from '@nestjs/config';

const PRODUCTION_ENV = 'production';
const ENABLED_VALUE = 'true';

/**
 * Falla cerrado: el seed del bench solo corre con `BENCH_SEED_ENABLED=true`
 * explícito. Una variable ausente o mal escrita lo apaga, y
 * `NODE_ENV=production` lo apaga aunque el flag diga `true`.
 */
export function isBenchSeedEnabled(configService: Pick<ConfigService, 'get'>): boolean {
  return (
    configService.get<string>('NODE_ENV') !== PRODUCTION_ENV &&
    configService.get<string>('BENCH_SEED_ENABLED') === ENABLED_VALUE
  );
}
