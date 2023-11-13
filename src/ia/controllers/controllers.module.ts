import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../infra/common/guards';
import { UseCasesProxyModule } from '../../infra/use-cases-proxy/use-cases-proxy.module';

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
  controllers: []
})
export class ControllersModule {}
