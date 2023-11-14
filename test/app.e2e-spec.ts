import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { mockDataSource } from './setup';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  jest.setTimeout(20000);

  beforeEach(async () => {
    const dataSource = await mockDataSource();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          synchronize: true
        }),
        AppModule
      ]
    })
      .overrideProvider(DataSource)
      .useValue(dataSource)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(404);
  });
});
