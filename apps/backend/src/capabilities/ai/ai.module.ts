import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AI_PROVIDER_PORT } from './application/ports/ai-provider.port';
import { AiCompletionService } from './application/services/ai-completion.service';
import { AiCoordinatorService } from './application/services/ai-coordinator.service';
import { AiFileAskService } from './application/services/ai-file-ask.service';
import { AiStatusService } from './application/services/ai-status.service';
import { AI_TOPICS } from './domain/ai-topics';
import { AI_CONFIG, AI_TOPICS_REGISTRY } from './domain/constants/ai.constants';
import type { TAiConfig } from './domain/interfaces/ai-config.interface';
import { FakeProvider } from './infrastructure/adapters/fake.provider';
import { IcaProvider } from './infrastructure/adapters/ica.provider';
import { buildAiConfig } from './infrastructure/config/ai-config';
import { AiController } from './infrastructure/controllers/ai.controller';

/** Exporta los servicios: otras capabilities importan `AiModule` e inyectan `AiCoordinatorService`. */
@Module({
  controllers: [AiController],
  providers: [
    AiCompletionService,
    AiCoordinatorService,
    AiFileAskService,
    AiStatusService,
    IcaProvider,
    FakeProvider,
    { provide: AI_CONFIG, inject: [ConfigService], useFactory: buildAiConfig },
    { provide: AI_TOPICS_REGISTRY, useValue: AI_TOPICS },
    {
      provide: AI_PROVIDER_PORT,
      inject: [AI_CONFIG, IcaProvider, FakeProvider],
      useFactory: (config: TAiConfig, ica: IcaProvider, fake: FakeProvider) =>
        config.enabled && config.provider === 'fake' ? fake : ica,
    },
  ],
  exports: [AiCoordinatorService, AiStatusService],
})
export class AiModule {}
