import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UseCasesProxyModule } from '../../infra/use-cases-proxy/use-cases-proxy.module';
import { AuthController } from './auth.controller';
import { ExampleController } from './example.controller';
import { ShortLinkController } from './shortlink.controller';
import { UserController } from './user.controller';

/**
 * Declare all controllers here
 */
@Module({
  imports: [ConfigModule, UseCasesProxyModule.register()],
  providers: [],
  controllers: [
    UserController,
    ShortLinkController,
    AuthController,
    ExampleController
  ]
})
export class ControllersModule {}
