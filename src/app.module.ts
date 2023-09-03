import * as Joi from '@hapi/joi';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './infra/database/database.module';
import { ControllersModule } from './infra/http/controllers/controllers.module';
import { BcryptModule } from './infra/services/bcrypt/bcrypt.module';
import { RepositoriesModule } from './infra/database/repositories/repositories.module';

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
    RepositoriesModule,
    ControllersModule,
    BcryptModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
