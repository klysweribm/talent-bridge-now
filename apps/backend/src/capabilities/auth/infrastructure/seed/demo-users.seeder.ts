import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { UserModel, type UserDocument } from '../adapters/user.schema';
import { isDevLoginEnabled } from '../config/dev-login.config';
import { BACKFILL_FIELDS, DEMO_USERS_SEED, type IDemoUserSeed } from './demo-users.seed-data';

/**
 * Siembra los usuarios demo al iniciar el módulo, solo si el login de
 * desarrollo está habilitado (`AUTH_DEV_LOGIN_ENABLED`) — sin él no hay
 * endpoint que los use, y en producción no deben existir. Idempotente vía
 * upsert por email (índice único): reiniciar el backend no duplica usuarios.
 * En usuarios ya existentes solo rellena los campos de perfil AUSENTES
 * (`$exists: false`): lo que alguien editó nunca se pisa.
 */
@Injectable()
export class DemoUsersSeeder implements OnModuleInit {
  private readonly logger = new Logger(DemoUsersSeeder.name);

  constructor(
    @InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!isDevLoginEnabled(this.configService)) {
      this.logger.log('Seed de usuarios demo omitido (AUTH_DEV_LOGIN_ENABLED no está en true)');
      return;
    }

    await Promise.all(DEMO_USERS_SEED.map((seed) => this.seedUser(seed)));

    this.logger.log(`Seed de usuarios demo verificado (${DEMO_USERS_SEED.length} usuarios)`);
  }

  private async seedUser(seed: IDemoUserSeed): Promise<void> {
    await this.userModel.updateOne({ email: seed.email }, { $setOnInsert: seed }, { upsert: true }).exec();
    const missing = BACKFILL_FIELDS.filter((field) => seed[field] !== undefined);
    await Promise.all(
      missing.map((field) => this.userModel.updateOne({ email: seed.email, [field]: { $exists: false } }, { $set: { [field]: seed[field] } }).exec()),
    );
  }
}
