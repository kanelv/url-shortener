import { createMock } from '@golevelup/ts-jest';
import {
  ExecutionContext,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { mockDataSource } from '../../../test/mock-data-source';
import { FindOneUserUseCase } from '../../application/use-cases/user';
import { DatabaseModule } from '../../infra/frameworks/database/database.module';
import { UseCasesProxyModule } from '../../infra/use-cases-proxy/use-cases-proxy.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { BasicAuthGuard } from './basic-auth.guard';

describe('BasicAuthGuard', () => {
  let dataSource: DataSource;
  let module: TestingModule;
  let basicAuthGuard: BasicAuthGuard;
  let findOneUserUseCase: FindOneUserUseCase;

  beforeEach(async () => {
    dataSource = await mockDataSource();

    module = await Test.createTestingModule({
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
        UseCasesProxyModule.register()
      ],
      providers: [BasicAuthGuard, Reflector]
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .setLogger(new Logger())
      .compile();

    basicAuthGuard = module.get<BasicAuthGuard>(BasicAuthGuard);
    findOneUserUseCase = module.get<FindOneUserUseCase>(FindOneUserUseCase);
  });

  afterEach(async () => {
    jest.clearAllMocks();
  });

  it('should be defined', async () => {
    expect(basicAuthGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return 200 OK when successfully authenticating', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Basic YWRtaW46YWRtaW4=`
            }
          })
        })
      });

      jest.spyOn(findOneUserUseCase, 'execute').mockReturnValue(
        Promise.resolve({
          id: 1,
          username: 'admin',
          password: 'admin'
        })
      );

      const canActivate = await basicAuthGuard.canActivate(
        mockExecutionContext
      );

      expect(canActivate).toBe(true);
    });

    it('should return 401 Unauthorized when username or password is incorrect', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Basic YmlkZGVyVXNlck5hbWU6QTEwMA==`
            }
          })
        })
      });

      jest
        .spyOn(findOneUserUseCase, 'execute')
        .mockRejectedValueOnce(new Error(`User not found`));

      await expect(
        basicAuthGuard.canActivate(mockExecutionContext)
      ).rejects.toThrow(
        new UnauthorizedException(`username or password is incorrect`)
      );
    });

    it('should return 401 Unauthorized when authorization header is not set', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({})
        })
      });

      await expect(
        basicAuthGuard.canActivate(mockExecutionContext)
      ).rejects.toThrow(
        new UnauthorizedException('Authorization header is missing')
      );
    });

    it('should return 401 Unauthorized when authorization header is not set only once in the request', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: [`Basic YmlkZGVyVXNlck5hbWU6QTEwMA==`]
            }
          })
        })
      });

      await expect(
        basicAuthGuard.canActivate(mockExecutionContext)
      ).rejects.toThrow(
        new UnauthorizedException(
          'Authorization header should be set only once in the request'
        )
      );
    });
  });
});
