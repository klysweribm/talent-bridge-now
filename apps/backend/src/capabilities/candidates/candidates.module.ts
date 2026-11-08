import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { AiModule } from '../ai/ai.module';
import { BenchModule } from '../bench/bench.module';
import { DocumentTextModule } from '../../shared/document-text/document-text.module';
import { SKILL_CATALOG_PORT } from './application/ports/skill-catalog.port';
import { CandidateListService } from './application/services/candidate-list.service';
import { CandidateMatchService } from './application/services/candidate-match.service';
import { CandidateProcessLinkService } from './application/services/candidate-process-link.service';
import { CandidateService } from './application/services/candidate.service';
import { CvExtractionService } from './application/services/cv-extraction.service';
import { CANDIDATE_REPOSITORY_PORT } from './domain/constants/candidate.constants';
import { CV_EXTRACTORS, CV_UPLOAD_CONFIG } from './domain/constants/cv.constants';
import { CandidateModel, CandidateSchema } from './infrastructure/adapters/candidate.schema';
import { BenchSkillCatalogAdapter } from './infrastructure/adapters/bench-skill-catalog.adapter';
import { ClassicCvExtractor } from './infrastructure/adapters/classic-cv-extractor.adapter';
import { CvIcaDraftService } from './infrastructure/adapters/cv-ica-draft.service';
import { IcaTextCvExtractor } from './infrastructure/adapters/ica-text-cv-extractor.adapter';
import { IcaCvExtractor } from './infrastructure/adapters/ica-cv-extractor.adapter';
import { MongooseCandidateAdapter } from './infrastructure/adapters/mongoose-candidate.adapter';
import { buildCvUploadConfig } from './infrastructure/config/cv-upload.config';
import { AvailableCandidatesController } from './infrastructure/controllers/available-candidates.controller';
import { CandidatesController } from './infrastructure/controllers/candidates.controller';
import { CandidatesListController } from './infrastructure/controllers/candidates-list.controller';

@Module({
  imports: [
    AiModule, BenchModule, DocumentTextModule,
    MongooseModule.forFeature([{ name: CandidateModel.name, schema: CandidateSchema }]),
    // Tope duro en memoria: +1 byte para que el servicio devuelva el 400 claro cuando el archivo solo excede un poco.
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ limits: { fileSize: buildCvUploadConfig(config).maxFileBytes + 1, files: 1 } }),
    }),
  ],
  controllers: [AvailableCandidatesController, CandidatesListController, CandidatesController],
  providers: [
    CvExtractionService,
    CandidateService,
    CandidateProcessLinkService, CandidateListService, CandidateMatchService,
    IcaCvExtractor,
    IcaTextCvExtractor,
    ClassicCvExtractor,
    CvIcaDraftService,
    { provide: SKILL_CATALOG_PORT, useClass: BenchSkillCatalogAdapter },
    { provide: CV_UPLOAD_CONFIG, inject: [ConfigService], useFactory: buildCvUploadConfig },
    // Un extractor nuevo = una clase + una línea aquí.
    {
      provide: CV_EXTRACTORS,
      inject: [IcaCvExtractor, IcaTextCvExtractor, ClassicCvExtractor],
      useFactory: (ica: IcaCvExtractor, icaText: IcaTextCvExtractor, classic: ClassicCvExtractor) => [ica, icaText, classic],
    },
    { provide: CANDIDATE_REPOSITORY_PORT, useClass: MongooseCandidateAdapter },
  ],
  // Procesos asocia/libera candidatos por llamada en memoria (ADR-013).
  exports: [CandidateProcessLinkService],
})
export class CandidatesModule {}
