import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './application/services/auth.service';
import { AUTH_EVENT_REPOSITORY_PORT } from './application/ports/auth-event-repository.port';
import { USER_REPOSITORY_PORT } from './application/ports/user-repository.port';
import { AuthEventModel, AuthEventSchema } from './infrastructure/adapters/auth-event.schema';
import { authEventRetentionSeconds } from './infrastructure/config/auth-event-retention.config';
import { MongooseAuthEventAdapter } from './infrastructure/adapters/mongoose-auth-event.adapter';
import { MongooseUserAdapter } from './infrastructure/adapters/mongoose-user.adapter';
import { UserModel, UserSchema } from './infrastructure/adapters/user.schema';
import { AuthSessionController } from './infrastructure/controllers/auth-session.controller';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { DemoUsersSeeder } from './infrastructure/seed/demo-users.seeder';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }]),
    MongooseModule.forFeatureAsync([
      {
        name: AuthEventModel.name,
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const schema = AuthEventSchema.clone();
          schema.index({ at: 1 }, { expireAfterSeconds: authEventRetentionSeconds(configService) });
          return schema;
        },
      },
    ]),
  ],
  controllers: [AuthController, AuthSessionController],
  providers: [
    AuthService,
    DemoUsersSeeder,
    { provide: USER_REPOSITORY_PORT, useClass: MongooseUserAdapter },
    { provide: AUTH_EVENT_REPOSITORY_PORT, useClass: MongooseAuthEventAdapter },
  ],
})
export class AuthModule {}
