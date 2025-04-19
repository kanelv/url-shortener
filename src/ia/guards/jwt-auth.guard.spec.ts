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
    it('should return true when successfully authenticating with JWT from cookies', async () => {
      MockDate.set('2024-03-26T03:03:00.000');

      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            cookies: {
              accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MTEzODk5MTAsImV4cCI6MTcxMTM5MDAzMCwiaXNzIjoiS2FuZSBJbmMuIn0.FcDmsYQliWf9JmIVUKSg1vVGA8vXrtxRsFjhVtK3iDY`
            }
          })
        })
      });

      jest.spyOn(userRepository, 'findOne').mockResolvedValue({
        id: 1,
        username: 'admin',
        password: 'admin'
      });

      jest.spyOn(jwtAuthGuard['jwtService'], 'verifyAsync').mockResolvedValue({
        sub: 3,
        username: 'admin',
        iat: 1711389910,
        exp: 1711390030,
        iss: 'Kane Inc.'
      });

      const canActivate = await jwtAuthGuard.canActivate(mockExecutionContext);

      expect(canActivate).toBe(true);
    });

    it('should return 401 Unauthorized when token is not found in request', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({})
        })
      });

      await expect(
        jwtAuthGuard.canActivate(mockExecutionContext)
      ).rejects.toThrow(
        new UnauthorizedException('Token not found in request')
      );
    });

    it('should return 401 Unauthorized when an invalid or empty token is provided', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            cookies: {
              accessToken: '' // Empty token
            }
          })
        })
      });

      await expect(
        jwtAuthGuard.canActivate(mockExecutionContext)
      ).rejects.toThrow(
        new UnauthorizedException('Token not found in request')
      );
    });

    it('should return 401 Unauthorized when an invalid token is provided in cookies', async () => {
      const mockExecutionContext = createMock<ExecutionContext>({
        switchToHttp: () => ({
          getRequest: () => ({
            cookies: {
              accessToken: 'invalid-token' // Invalid token
            }
          })
        })
      });

      jest
        .spyOn(jwtAuthGuard['jwtService'], 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(
        jwtAuthGuard.canActivate(mockExecutionContext)
      ).rejects.toThrow(new UnauthorizedException());
    });
  });
});
