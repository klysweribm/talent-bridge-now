import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from '../auth/auth.module';
import { CandidatesModule } from '../candidates/candidates.module';
import { CANDIDATE_DIRECTORY_PORT, PROCESSES_CONFIG, PROCESS_REPOSITORY_PORT } from './domain/constants/process.constants';
import { ProcessCandidateClaimService } from './application/services/process-candidate-claim.service';
import { ProcessDetailService } from './application/services/process-detail.service';
import { ProcessCandidatesService } from './application/services/process-candidates.service';
import { ProcessService } from './application/services/process.service';
import { CandidateDirectoryAdapter } from './infrastructure/adapters/candidate-directory.adapter';
import { MongooseProcessAdapter } from './infrastructure/adapters/mongoose-process.adapter';
import { ProcessModel, ProcessSchema } from './infrastructure/adapters/process.schema';
import { buildProcessesConfig } from './infrastructure/config/processes.config';
import { ProcessCandidatesController } from './infrastructure/controllers/process-candidates.controller';
import { ProcessesController } from './infrastructure/controllers/processes.controller';

@Module({
  imports: [AuthModule, CandidatesModule, MongooseModule.forFeature([{ name: ProcessModel.name, schema: ProcessSchema }])],
  controllers: [ProcessesController, ProcessCandidatesController],
  providers: [
    ProcessService,
    ProcessCandidatesService,
    ProcessCandidateClaimService,
    ProcessDetailService,
    { provide: PROCESSES_CONFIG, inject: [ConfigService], useFactory: buildProcessesConfig },
    { provide: PROCESS_REPOSITORY_PORT, useClass: MongooseProcessAdapter },
    { provide: CANDIDATE_DIRECTORY_PORT, useClass: CandidateDirectoryAdapter },
  ],
  exports: [ProcessService],
})
export class ProcessesModule {}
