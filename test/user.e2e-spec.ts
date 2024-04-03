import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import MockDate from 'mockdate';
import request from 'supertest';
import { SignUpUserDto } from '../src/ia/dto/user';
import { e2eSetup } from './common/e2e-setup';
import { e2eTearDown } from './common/e2e-tear-down';

describe('User (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;

  // jest.setTimeout(20000);

  beforeEach(async () => {
    const setup = await e2eSetup();
    module = setup.module;
    app = setup.app;
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
        userName: 'sample',
        password: 'sample',
        email: 'sample@gmail.com'
      };

      const response = await request(app.getHttpServer())
        .post('/v1/users')
        .send(signUpUserDto)
        .expect(201);

      expect(response.body).toEqual({
        user: {
          id: 1
        }
      });
    });

    it('should return 400 Bad Request when submitting an invalid email', async () => {
      const signUpUserDto: SignUpUserDto = {
        userName: 'sample',
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
    it('returns statusCode 200 and data when successfully submitting', async () => {
      MockDate.set('2024-03-26T03:03:00.000');

      const response = await request(app.getHttpServer())
        .get(`/v1/users`)
        .set(
          'Authorization',
          `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjMsInVzZXJuYW1lIjoiYWRtaW4iLCJpYXQiOjE3MTEzODk5MTAsImV4cCI6MTcxMTM5MDAzMCwiaXNzIjoiS2FuZSBJbmMuIn0.FcDmsYQliWf9JmIVUKSg1vVGA8vXrtxRsFjhVtK3iDY`
        )
        .expect(200);

      expect(response.body).toEqual({ users: [] });
    });
  });

  // describe('GET /v1/users/:id', () => {});

  // describe('PATCH /v1/users/:id', () => {});

  // describe('DELETE /v1/users/:id', () => {});
});
