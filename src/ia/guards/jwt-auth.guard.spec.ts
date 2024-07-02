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
import MockDate from 'mockdate';
import { DataSource } from 'typeorm';
import { mockDataSource } from '../../../test/mock-data-source';
import { AbstractUserRepository } from '../../domain/contracts/repositories';
import { DatabaseModule } from '../../infra/frameworks/database/database.module';
import { RepositoriesModule } from '../repositories/repositories.module';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let dataSource: DataSource;
  let module: TestingModule;
  let jwtAuthGuard: JwtAuthGuard;
  let userRepository: AbstractUserRepository;

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
        RepositoriesModule
      ],
      providers: [JwtAuthGuard, Reflector]
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .setLogger(new Logger())
      .compile();

    jwtAuthGuard = module.get<JwtAuthGuard>(JwtAuthGuard);
    userRepository = module.get<AbstractUserRepository>(AbstractUserRepository);
  });

  afterEach(async () => {
    jest.clearAllMocks();
    MockDate.reset();
  });

  it('should be defined', () => {
    expect(jwtAuthGuard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return 200 OK when successfully authenticating', async () => {
      MockDate.set('2024-03-26T03:03:00.000');

      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MTEzODk5MTAsImV4cCI6MTcxMTM5MDAzMCwiaXNzIjoiS2FuZSBJbmMuIn0.FcDmsYQliWf9JmIVUKSg1vVGA8vXrtxRsFjhVtK3iDY`
            }
          })
        })
      });

      jest.spyOn(userRepository, 'findOne').mockReturnValue(
        Promise.resolve({
          id: 1,
          username: 'admin',
          password: 'admin'
        })
      );

      const canActivate = await jwtAuthGuard.canActivate(mockExecutionContext);

      expect(canActivate).toBe(true);
    });

    it('should return 401 Unauthorized when submitting an unacceptable Bearer token', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              authorization: 'Bearer '
            }
          })
        })
      });

      await expect(
        jwtAuthGuard.canActivate(mockExecutionContext)
      ).rejects.toThrow(
        new UnauthorizedException('Not found token in the request header')
      );
    });

    it('should return 401 Unauthorized when authorization header is not set', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({})
        })
      });

      await expect(
        jwtAuthGuard.canActivate(mockExecutionContext)
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
        jwtAuthGuard.canActivate(mockExecutionContext)
      ).rejects.toThrow(
        new UnauthorizedException(
          'Authorization header should be set only once in the request'
        )
      );
    });
  });
});
