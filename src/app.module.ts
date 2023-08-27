import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './core/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UrlModule } from './modules/url/url.module';
import { UserModule } from './modules/user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USER: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        URL_SHORTENER_DOMAIN: Joi.string().required(),
        JWT_PRIVATE_KEY: Joi.string().required(),
        JWT_PUBLIC_KEY: Joi.string().required(),
        MEMBER_EXPIRES_IN: Joi.string().required(),
        GUESS_EXPIRES_IN: Joi.string().required(),
        TOKEN_EXPIRES_IN: Joi.string().required()
      })
    }),
    DatabaseModule,
    UrlModule,
    UserModule,
    AuthModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
