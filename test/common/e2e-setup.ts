import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { ControllersModule } from '../../src/ia/controllers/controllers.module';
import { JwtAuthGuard } from '../../src/ia/guards';
import { BasicAuthGuard } from '../../src/ia/guards/basic-auth.guard';
import { RepositoriesModule } from '../../src/ia/repositories/repositories.module';
import { DatabaseModule } from '../../src/infra/frameworks/database/database.module';
import { mockDataSource } from '../mock-database';

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
            secret: configService.get('JWT_SECRET_KEY'),
            signOptions: {
              expiresIn: configService.get('JWT_TOKEN_EXPIRES_IN', '120s'),
              issuer: 'Kane Inc.'
              // algorithm: 'RS256'
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
    providers: [BasicAuthGuard, JwtAuthGuard]
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
