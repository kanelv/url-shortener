import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BcryptModule } from '../../services/bcrypt/bcrypt.module';
import { Url, User } from '../entities';
import { UrlRepository } from './url.repository';
import { UserRepository } from './user.repository';
import fs from 'fs';
import path from 'path';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, Url]),
    BcryptModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const options: JwtModuleOptions = {
          privateKey: fs.readFileSync(
            path.resolve('', configService.get('JWT_PRIVATE_KEY'))
          ),
          publicKey: fs.readFileSync(
            path.resolve('', configService.get('JWT_PUBLIC_KEY'))
          ),
          signOptions: {
            expiresIn: configService.get('TOKEN_EXPIRES_IN', '24h'),
            issuer: 'AuthService',
            algorithm: 'RS256'
          }
        };
        return options;
      },
      inject: [ConfigService]
    })
  ],
  providers: [UserRepository, UrlRepository],
  exports: [UserRepository, UrlRepository]
})
export class RepositoriesModule {}
