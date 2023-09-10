import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../common/guards';
import { UseCasesProxyModule } from '../../use-cases-proxy/use-cases-proxy.module';
import { AuthController } from './auth.controller';
import { UrlController } from './url.controller';
import { UserController } from './user.controller';

@Module({
  imports: [ConfigModule, UseCasesProxyModule.register()],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
  controllers: [UserController, UrlController, AuthController]
})
export class ControllersModule {}
