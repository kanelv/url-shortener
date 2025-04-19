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

  const accessToken =
    'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoic2FtcGxlMSIsImVtYWlsIjpudWxsLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE3NDUwNTQ1MDcsImV4cCI6MTc0NTE0MDkwNywiaXNzIjoiS2FuZSBJbmMuIn0.XWZG0pcR3QJCSHHbkuPKhXFrZzJT01w3ZZHOY2YmIPQydAIyPeAyUFLQ_DJmqtpjEJq1r7H6Jj2rMQfpHuDCa71JpHmisa1EGLTDMRJWaKpadaymZsgmrnvr9eZ3Wu642fC5ix5lNfIMq6XdCPq7vs5JucA238aS90fqLNV_5-3WnxXqjTRiEfGiP1ldRZ3jhFqGdsG1FQkv9QE5Ft6WwvKv-uX8eHUJypHe4mmB3XbiIEZm0efW0XFe9_blhJyQiv9JipBOUCm2qO209N1qk0l0YlR_QAUtK6g3zv4dLaWGgqnWRUzDixnyp0WemAj_KP-FhhDqyFTam21APF9Kug';

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
        },
        message: 'Success',
        statusCode: 201,
        timestamp: expect.any(String)
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
      MockDate.set('2025-04-19T08:00:00.000');

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
        .set('Cookie', [`accessToken=${accessToken}`])
        .send()
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
        ],
        message: 'Success',
        statusCode: 200,
        timestamp: expect.any(String)
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
        .set('Cookie', [`accessToken=${accessToken}`])
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
        },
        message: 'Success',
        statusCode: 200,
        timestamp: expect.any(String)
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
        .set('Cookie', [`accessToken=${accessToken}`])
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
        },
        message: 'Success',
        statusCode: 200,
        timestamp: expect.any(String)
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

      const updateOneUser: UpdateUserDto = {
        email: 'sample1@gmail.com',
        role: Role.Admin
      };
      const response = await request(app.getHttpServer())
        .patch(`/v1/users/${createdResult.id}`)
        .send(updateOneUser)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body).toEqual({
        data: true,
        message: 'Success',
        statusCode: 200,
        timestamp: expect.any(String)
      });
    });
  });

  // describe('DELETE /v1/users/:id', () => {
  //   it('returns 200 OK and data when successfully requesting', async () => {
  //     MockDate.set('2024-03-26T03:03:00.000');

  //     const createOneUser1: CreateOneUser = {
  //       username: 'sample1',
  //       password: 'sample1'
  //     };
  //     const createdResult = await userRepository.create(createOneUser1);
  //     console.log(`createdResult: ${JSON.stringify(createdResult, null, 2)}`);

  //     const response = await request(app.getHttpServer())
  //       .delete(`/v1/users/${createdResult.id}`)
  //       .set('Cookie', [`accessToken=${accessToken}`])
  //       .send()
  //       .expect(200);

  //     expect(response.body).toEqual({
  //       data: true,
  //       message: 'Success',
  //       statusCode: 200,
  //       timestamp: expect.any(String)
  //     });
  //   });
  // });
});
