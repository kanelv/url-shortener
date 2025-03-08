import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import fs from 'fs';
import path from 'path';
import { ControllersModule } from './ia/controllers/controllers.module';
import { JwtAuthGuard } from './ia/guards';
import { RolesGuard } from './ia/guards/roles.guard';
import { ResponseInterceptor } from './ia/interceptors/response.interceptor';
import { DatabaseModule } from './infra/frameworks/database/database.module';
import { BcryptModule } from './infra/services/bcrypt/bcrypt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        URL_SHORTENER_URL: Joi.string().required(),
        JWT_PRIVATE_KEY: Joi.string().required(),
        JWT_PUBLIC_KEY: Joi.string().required(),
        MAX_AGE: Joi.number().required(),
        HTTP_ONLY: Joi.boolean().required(),
        SECURE: Joi.boolean().required(),
        SAME_SITE: Joi.string().required(),
        MEMBER_EXPIRES_IN: Joi.string().required(),
        GUESS_EXPIRES_IN: Joi.string().required(),
        TOKEN_EXPIRES_IN: Joi.string().required()
      })
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const options: JwtModuleOptions = {
          privateKey: fs.readFileSync(
            path.resolve(
              '',
              configService.get('JWT_PRIVATE_KEY', `src/certs/jwt/private.pem`)
            )
          ),
          publicKey: fs.readFileSync(
            path.resolve(
              '',
              configService.get('JWT_PUBLIC_KEY', `src/certs/jwt/public.pem`)
            )
          ),
          signOptions: {
            expiresIn: configService.get('JWT_TOKEN_EXPIRES_IN', '24h'),
            issuer: 'AuthService',
            algorithm: 'RS256'
          }
        };
        return options;
      },
      inject: [ConfigService]
    }),
    DatabaseModule,
    ControllersModule,
    BcryptModule
  ],
  providers: [
    {
      provide: 'APP_GUARD',
      useClass: JwtAuthGuard
    },
    {
      provide: 'APP_GUARD',
      useClass: RolesGuard
    },
    {
      provide: 'APP_INTERCEPTOR',
      useClass: ResponseInterceptor
    }
  ]
})
export class AppModule {}
