import { Inject, Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BENCH_REPOSITORY_PORT, type IBenchRepositoryPort } from '../../application/ports/bench-repository.port';
import { isBenchSeedEnabled } from '../config/bench-seed.config';
import { BENCH_SEED_RAW } from './bench-seed.source';
import { validateBenchSeed } from './bench-seed.validator';

/**
 * Siembra los recursos de bench del mock al iniciar el módulo, solo si
 * `BENCH_SEED_ENABLED=true` (falla cerrado, nunca en producción). Idempotente:
 * el puerto hace upsert por `benchCode`. Un mock inválido aborta el arranque.
 */
@Injectable()
export class BenchSeeder implements OnModuleInit {
  private readonly logger = new Logger(BenchSeeder.name);

  constructor(
    @Inject(BENCH_REPOSITORY_PORT) private readonly repository: IBenchRepositoryPort,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!isBenchSeedEnabled(this.configService)) {
      this.logger.log('bench seed skipped (BENCH_SEED_ENABLED is not true or NODE_ENV=production)');
      return;
    }
    const resources = validateBenchSeed(BENCH_SEED_RAW);
    const upserted = await this.repository.upsertMany(resources);
    this.logger.log(`bench seed: ${upserted} upserted`);
  }
}
