import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { UserModel, type UserDocument } from '../adapters/user.schema';
import { DEMO_USERS_SEED } from './demo-users.seed-data';

/**
 * Siembra los 3 usuarios demo al iniciar el módulo. Idempotente vía upsert
 * por email (índice único) — reiniciar el backend no duplica usuarios.
 */
@Injectable()
export class DemoUsersSeeder implements OnModuleInit {
  private readonly logger = new Logger(DemoUsersSeeder.name);

  constructor(@InjectModel(UserModel.name) private readonly userModel: Model<UserDocument>) {}

  async onModuleInit(): Promise<void> {
    await Promise.all(
      DEMO_USERS_SEED.map((seed) =>
        this.userModel
          .updateOne(
            { email: seed.email },
            { $setOnInsert: seed },
            { upsert: true },
          )
          .exec(),
      ),
    );

    this.logger.log(`Seed de usuarios demo verificado (${DEMO_USERS_SEED.length} usuarios)`);
  }
}
