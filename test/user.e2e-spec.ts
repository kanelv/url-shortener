import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import MockDate from 'mockdate';
import request from 'supertest';
import {
  AbstractUserRepository,
  CreateOneUser
} from '../src/domain/contracts/repositories';
import { Role } from '../src/domain/entities/enums';
import { SignUpUserDto, UpdateUserDto } from '../src/ia/dto/user';
import { e2eSetup } from './common/e2e-setup';
import { e2eTearDown } from './common/e2e-tear-down';

describe('User (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  let userRepository: AbstractUserRepository;

  beforeEach(async () => {
    const setup = await e2eSetup();
    module = setup.module;
    app = setup.app;

    userRepository = module.get<AbstractUserRepository>(AbstractUserRepository);
  });

  afterEach(async () => {
    await e2eTearDown(app);
    jest.clearAllMocks();
    MockDate.reset();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /v1/users', () => {
    it('should return 201 Created when successfully submitting an acceptable SignUpUserDto', async () => {
      const signUpUserDto: SignUpUserDto = {
        username: 'sample',
        password: 'sample',
        email: 'sample@gmail.com'
      };

      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .send(signUpUserDto)
        .expect(201);

      expect(response.body).toEqual({
        data: {
          id: 1
        }
      });
    });

    it('should return 400 Bad Request when submitting an invalid email', async () => {
      const signUpUserDto: SignUpUserDto = {
        username: 'sample',
        password: 'sample',
        email: 'sample'
      };

      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .send(signUpUserDto)
        .expect(400);

      expect(response.body).toEqual({
        statusCode: 400,
        error: 'Bad Request',
        message: ['email must be an email']
      });
    });
  });

  describe('GET /v1/users', () => {
    it('should return 200 OK and data when successfully requesting', async () => {
      MockDate.set('2024-03-26T03:03:00.000');

      const createOneUser1: CreateOneUser = {
        username: 'sample1',
        password: 'sample1'
      };
      const createOneUser2: CreateOneUser = {
        username: 'sample2',
        password: 'sample2'
      };

      await userRepository.create(createOneUser1);
      await userRepository.create(createOneUser2);

      const response = await request(app.getHttpServer())
        .get(`/v1/users`)
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MTEzODk5MTAsImV4cCI6MTcxMTM5MDAzMCwiaXNzIjoiS2FuZSBJbmMuIn0.FcDmsYQliWf9JmIVUKSg1vVGA8vXrtxRsFjhVtK3iDY`
        )
        .expect(200);

      expect(response.body).toEqual({
        data: [
          {
            createdAt: expect.any(String),
            email: null,
            id: expect.any(Number),
            isActive: true,
            role: 'user',
            updatedAt: expect.any(String),
            username: 'sample1'
          },
          {
            createdAt: expect.any(String),
            email: null,
            id: expect.any(Number),
            isActive: true,
            role: 'user',
            updatedAt: expect.any(String),
            username: 'sample2'
          }
        ]
      });
    });
  });

  describe('GET /v1/users/:id', () => {
    it('should return 200 OK and data when successfully requesting', async () => {
      MockDate.set('2024-03-26T03:03:00.000');

      const createOneUser1: CreateOneUser = {
        username: 'sample1',
        password: 'sample1'
      };

      const createdResult = await userRepository.create(createOneUser1);

      const response = await request(app.getHttpServer())
        .get(`/v1/users/${createdResult.id}`)
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MTEzODk5MTAsImV4cCI6MTcxMTM5MDAzMCwiaXNzIjoiS2FuZSBJbmMuIn0.FcDmsYQliWf9JmIVUKSg1vVGA8vXrtxRsFjhVtK3iDY`
        )
        .expect(200);

      expect(response.body).toEqual({
        data: {
          createdAt: expect.any(String),
          email: null,
          id: expect.any(Number),
          isActive: true,
          role: 'user',
          updatedAt: expect.any(String),
          username: 'sample1'
        }
      });
    });

    it('should return 400 Bad Request and data when successfully requesting', async () => {
      MockDate.set('2024-03-26T03:03:00.000');

      const createOneUser1: CreateOneUser = {
        username: 'sample1',
        password: 'sample1'
      };

      const createdResult = await userRepository.create(createOneUser1);

      const response = await request(app.getHttpServer())
        .get(`/v1/users/${createdResult.id}`)
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MTEzODk5MTAsImV4cCI6MTcxMTM5MDAzMCwiaXNzIjoiS2FuZSBJbmMuIn0.FcDmsYQliWf9JmIVUKSg1vVGA8vXrtxRsFjhVtK3iDY`
        )
        .expect(200);

      expect(response.body).toEqual({
        data: {
          createdAt: expect.any(String),
          email: null,
          id: expect.any(Number),
          isActive: true,
          role: 'user',
          updatedAt: expect.any(String),
          username: 'sample1'
        }
      });
    });
  });

  describe('PATCH /v1/users/:id', () => {
    it('returns 200 OK and data when successfully requesting', async () => {
      MockDate.set('2024-03-26T03:03:00.000');

      const createOneUser1: CreateOneUser = {
        username: 'sample1',
        password: 'sample1'
      };
      const createdResult = await userRepository.create(createOneUser1);

      console.log(
        `userRepository.findAll(): ${JSON.stringify(
          await userRepository.findAll(),
          null,
          2
        )}`
      );

      console.log(
        `userRepository.isExist(): ${JSON.stringify(
          await userRepository.isExist({
            id: createdResult.id
          }),
          null,
          2
        )}`
      );

      const updateOneUser: UpdateUserDto = {
        email: 'sample1@gmail.com',
        role: Role.Admin
      };
      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${createdResult.id}`)
        .send(updateOneUser)
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MTEzODk5MTAsImV4cCI6MTcxMTM5MDAzMCwiaXNzIjoiS2FuZSBJbmMuIn0.FcDmsYQliWf9JmIVUKSg1vVGA8vXrtxRsFjhVtK3iDY`
        )
        .expect(200);

      expect(response.body).toEqual({
        data: true
      });
    });
  });

  // describe('DELETE /v1/users/:id', () => {});
});
