import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../infra/common/guards';
import { UseCasesProxyModule } from '../../infra/use-cases-proxy/use-cases-proxy.module';
import { UserController } from './user.controller';
import { UrlController } from './url.controller';

/**
 * Declare all controllers here
 */
@Module({
  imports: [ConfigModule, UseCasesProxyModule.register()],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
  controllers: [UserController, UrlController]
})
export class ControllersModule {}
