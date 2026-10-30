import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BENCH_REPOSITORY_PORT } from './application/ports/bench-repository.port';
import { BenchService } from './application/services/bench.service';
import { BenchResourceModel, BenchResourceSchema } from './infrastructure/adapters/bench-resource.schema';
import { MongooseBenchAdapter } from './infrastructure/adapters/mongoose-bench.adapter';
import { BenchController } from './infrastructure/controllers/bench.controller';
import { BenchSeeder } from './infrastructure/seed/bench.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: BenchResourceModel.name, schema: BenchResourceSchema }]),
  ],
  controllers: [BenchController],
  providers: [
    BenchService,
    BenchSeeder,
    { provide: BENCH_REPOSITORY_PORT, useClass: MongooseBenchAdapter },
  ],
})
export class BenchModule {}
