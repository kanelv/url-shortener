import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UseCasesProxyModule } from '../../infra/use-cases-proxy/use-cases-proxy.module';
import { AuthController } from './auth.controller';
import { UrlController } from './url.controller';
import { UserController } from './user.controller';

/**
 * Declare all controllers here
 */
@Module({
  imports: [ConfigModule, UseCasesProxyModule.register()],
  providers: [],
  controllers: [UserController, UrlController, AuthController]
})
export class ControllersModule {}
