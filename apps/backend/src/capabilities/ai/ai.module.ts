import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentTextModule } from '../../shared/document-text/document-text.module';
import { AI_PROVIDER_PORT } from './application/ports/ai-provider.port';
import { AiCompletionService } from './application/services/ai-completion.service';
import { AiCoordinatorService } from './application/services/ai-coordinator.service';
import { AiFileAskService } from './application/services/ai-file-ask.service';
import { AiStatusService } from './application/services/ai-status.service';
import { OpportunityDraftFileService } from './application/services/opportunity-draft-file.service';
import { OpportunityDraftService } from './application/services/opportunity-draft.service';
import { AI_TOPICS } from './domain/ai-topics';
import { AI_CONFIG, AI_TOPICS_REGISTRY } from './domain/constants/ai.constants';
import type { TAiConfig } from './domain/interfaces/ai-config.interface';
import { FakeProvider } from './infrastructure/adapters/fake.provider';
import { IcaProvider } from './infrastructure/adapters/ica.provider';
import { OPPORTUNITY_DRAFT_CONFIG, OPPORTUNITY_SOURCE_CONFIG } from './domain/opportunity-draft/opportunity-draft.constants';
import { buildAiConfig } from './infrastructure/config/ai-config';
import { buildOpportunityDraftConfig } from './infrastructure/config/opportunity-draft-config';
import { buildOpportunitySourceConfig } from './infrastructure/config/opportunity-source-config';
import { AiController } from './infrastructure/controllers/ai.controller';
import { OpportunityDraftFileController } from './infrastructure/controllers/opportunity-draft-file.controller';

/** Exporta los servicios: otras capabilities importan `AiModule` e inyectan `AiCoordinatorService`. */
@Module({
  imports: [
    DocumentTextModule,
    // Tope duro en memoria: +1 byte para que el servicio devuelva el 400 claro cuando el archivo solo excede un poco.
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return { limits: { fileSize: buildOpportunitySourceConfig(config).maxFileBytes + 1, files: 1 } };
      },
    }),
  ],
  controllers: [AiController, OpportunityDraftFileController],
  providers: [
    AiCompletionService,
    AiCoordinatorService,
    AiFileAskService,
    AiStatusService,
    OpportunityDraftService,
    OpportunityDraftFileService,
    IcaProvider,
    FakeProvider,
    { provide: AI_CONFIG, inject: [ConfigService], useFactory: buildAiConfig },
    { provide: OPPORTUNITY_DRAFT_CONFIG, inject: [ConfigService], useFactory: buildOpportunityDraftConfig },
    { provide: OPPORTUNITY_SOURCE_CONFIG, inject: [ConfigService], useFactory: buildOpportunitySourceConfig },
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
