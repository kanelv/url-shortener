import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import fs from 'fs';
import path from 'path';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '../../common/auth.guard';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log(
          `path.resolve('', configService.get('JWT_PRIVATE_KEY')): ${path.resolve(
            '',
            configService.get('JWT_PRIVATE_KEY')
          )}`
        );
        const options: JwtModuleOptions = {
          privateKey: fs.readFileSync(
            path.resolve('', configService.get('JWT_PRIVATE_KEY'))
          ),
          publicKey: fs.readFileSync(
            path.resolve('', configService.get('JWT_PUBLIC_KEY'))
          ),
          signOptions: {
            expiresIn: '24h',
            issuer: 'AuthService',
            algorithm: 'RS256'
          }
        };
        return options;
      },
      inject: [ConfigService]
    })
  ],
  providers: [
    AuthService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard
    }
  ],
  controllers: [AuthController],
  exports: [AuthService]
})
export class AuthModule {}
