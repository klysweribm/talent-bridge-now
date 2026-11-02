import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { AiModule } from '../ai/ai.module';
import { BenchModule } from '../bench/bench.module';
import { SKILL_CATALOG_PORT } from './application/ports/skill-catalog.port';
import { CandidateMatchService } from './application/services/candidate-match.service';
import { CandidateService } from './application/services/candidate.service';
import { CvExtractionService } from './application/services/cv-extraction.service';
import { CANDIDATE_REPOSITORY_PORT } from './domain/constants/candidate.constants';
import { CV_TEXT_EXTRACTOR_PORT } from './application/ports/cv-text-extractor.port';
import { CV_EXTRACTORS, CV_UPLOAD_CONFIG } from './domain/constants/cv.constants';
import { CandidateModel, CandidateSchema } from './infrastructure/adapters/candidate.schema';
import { BenchSkillCatalogAdapter } from './infrastructure/adapters/bench-skill-catalog.adapter';
import { ClassicCvExtractor } from './infrastructure/adapters/classic-cv-extractor.adapter';
import { CvIcaDraftService } from './infrastructure/adapters/cv-ica-draft.service';
import { IcaTextCvExtractor } from './infrastructure/adapters/ica-text-cv-extractor.adapter';
import { LocalCvTextExtractor } from './infrastructure/adapters/local-cv-text-extractor.adapter';
import { IcaCvExtractor } from './infrastructure/adapters/ica-cv-extractor.adapter';
import { MongooseCandidateAdapter } from './infrastructure/adapters/mongoose-candidate.adapter';
import { buildCvUploadConfig } from './infrastructure/config/cv-upload.config';
import { CandidatesController } from './infrastructure/controllers/candidates.controller';

@Module({
  imports: [
    AiModule,
    BenchModule,
    MongooseModule.forFeature([{ name: CandidateModel.name, schema: CandidateSchema }]),
    // Tope duro en memoria: +1 byte para que el servicio devuelva el 400 claro cuando el archivo solo excede un poco.
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ limits: { fileSize: buildCvUploadConfig(config).maxFileBytes + 1, files: 1 } }),
    }),
  ],
  controllers: [CandidatesController],
  providers: [
    CvExtractionService,
    CandidateService,
    CandidateMatchService,
    IcaCvExtractor,
    IcaTextCvExtractor,
    ClassicCvExtractor,
    CvIcaDraftService,
    { provide: CV_TEXT_EXTRACTOR_PORT, useClass: LocalCvTextExtractor },
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
})
export class CandidatesModule {}
