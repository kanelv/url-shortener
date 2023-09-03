import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { UrlController } from './url.controller';
import { UserController } from './user.controller';
import { RepositoriesModule } from '../../database/repositories/repositories.module';
import {
  DeleteUserUseCase,
  FindAllUserUseCase,
  FindOneUserUseCase,
  SignInUserUseCase,
  SignUpUserUseCase,
  UpdateUserUseCase
} from '../../../application/use-cases/user';
import {
  RedirectUrlUseCase,
  ShortenUrlUseCase
} from '../../../application/use-cases/url';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../common/guards';

@Module({
  imports: [ConfigModule, RepositoriesModule],
  providers: [
    SignUpUserUseCase,
    SignInUserUseCase,
    FindAllUserUseCase,
    FindOneUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
    ShortenUrlUseCase,
    RedirectUrlUseCase,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
  controllers: [UserController, UrlController, AuthController]
})
export class ControllersModule {}
