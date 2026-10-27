import type { ConfigService } from '@nestjs/config';

const PRODUCTION_ENV = 'production';
const ENABLED_VALUE = 'true';

export const FLOW_LOG_FLAG = 'FLOW_LOG_ENABLED';

/**
 * Falla cerrado (mismo patrón que `isDevLoginEnabled`): FlowLog solo existe con
 * `FLOW_LOG_ENABLED=true` exacto, y `NODE_ENV=production` lo apaga siempre.
 */
export function isFlowLogEnabled(configService: Pick<ConfigService, 'get'>): boolean {
  return (
    configService.get<string>('NODE_ENV') !== PRODUCTION_ENV &&
    configService.get<string>(FLOW_LOG_FLAG) === ENABLED_VALUE
  );
}

/** El flag pidió activarlo pero NODE_ENV=production lo anula (para avisar al arrancar). */
export function isFlowLogOverriddenByProduction(
  configService: Pick<ConfigService, 'get'>,
): boolean {
  return (
    configService.get<string>('NODE_ENV') === PRODUCTION_ENV &&
    configService.get<string>(FLOW_LOG_FLAG) === ENABLED_VALUE
  );
}
