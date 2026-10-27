import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isFlowLogEnabled, isFlowLogOverriddenByProduction, FLOW_LOG_FLAG } from './flow-log.config';

const IGNORED_PATHS = /^(\/api\/v\d+)?\/health(\/|$)|^\/api\/docs(\/|$)/;
const QUERY_SEPARATOR = '?';

@Injectable()
export class FlowLogService implements OnModuleInit {
  private readonly logger = new Logger('FlowLog');
  readonly enabled: boolean;
  private readonly overriddenByProduction: boolean;

  constructor(configService: ConfigService) {
    this.enabled = isFlowLogEnabled(configService);
    this.overriddenByProduction = isFlowLogOverriddenByProduction(configService);
  }

  onModuleInit(): void {
    if (this.enabled) {
      this.logger.warn('FlowLog ACTIVO: muestra headers/body (secretos ocultos, PII visible). Solo desarrollo.');
    } else if (this.overriddenByProduction) {
      this.logger.warn(`${FLOW_LOG_FLAG} ignorado: NODE_ENV=production`);
    }
  }

  isIgnoredPath(url: string): boolean {
    return IGNORED_PATHS.test(url.split(QUERY_SEPARATOR)[0] ?? url);
  }

  emit(block: string): void {
    this.logger.log(block);
  }
}
