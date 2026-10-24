import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthService } from './application/services/auth.service';
import { USER_REPOSITORY_PORT } from './application/ports/user-repository.port';
import { MongooseUserAdapter } from './infrastructure/adapters/mongoose-user.adapter';
import { UserModel, UserSchema } from './infrastructure/adapters/user.schema';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { DemoUsersSeeder } from './infrastructure/seed/demo-users.seeder';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserModel.name, schema: UserSchema }])],
  controllers: [AuthController],
  providers: [
    AuthService,
    DemoUsersSeeder,
    { provide: USER_REPOSITORY_PORT, useClass: MongooseUserAdapter },
  ],
})
export class AuthModule {}
