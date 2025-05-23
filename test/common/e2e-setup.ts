import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import fs from 'fs';
import path from 'path';
import { DataSource } from 'typeorm';
import { ControllersModule } from '../../src/ia/controllers/controllers.module';
import { JwtAuthGuard } from '../../src/ia/guards';
import { RolesGuard } from '../../src/ia/guards/roles.guard';
import { ResponseInterceptor } from '../../src/ia/interceptors/response.interceptor';
import { RepositoriesModule } from '../../src/ia/repositories/repositories.module';
import { DatabaseModule } from '../../src/infra/frameworks/database/database.module';
import { mockDataSource } from '../mock-data-source';

export async function e2eSetup() {
  const dataSource = await mockDataSource();

  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        envFilePath: '.env.test'
      }),
      JwtModule.registerAsync({
        global: true,
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => {
          const options: JwtModuleOptions = {
            privateKey: fs.readFileSync(
              path.resolve(
                '',
                configService.get(
                  'JWT_PRIVATE_KEY',
                  `src/certs/jwt/private.pem`
                )
              )
            ),
            publicKey: fs.readFileSync(
              path.resolve(
                '',
                configService.get('JWT_PUBLIC_KEY', `src/certs/jwt/public.pem`)
              )
            ),
            signOptions: {
              expiresIn: configService.get('JWT_TOKEN_EXPIRES_IN', '120s'),
              issuer: configService.get('ISSUER', 'Kane Inc.'),
              algorithm: 'RS256'
            }
          };
          return options;
        },
        inject: [ConfigService]
      }),
      DatabaseModule,
      RepositoriesModule,
      ControllersModule
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
    .overrideProvider(DataSource)
    .useValue(dataSource)
    .setLogger(new Logger())
    .compile();

  const app = module.createNestApplication({
    logger: false
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      stopAtFirstError: true,
      enableDebugMessages: true
    })
  );

  app.use(cookieParser());

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1'
  });

  await app.init();

  return {
    module,
    app
  };
}
