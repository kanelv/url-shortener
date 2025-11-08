import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TestingModule } from '@nestjs/testing';
import MockDate from 'mockdate';
import request from 'supertest';
import {
  AbstractShortLinkRepository,
  AbstractUserRepository
} from '../src/domain/contracts/repositories';
import { Role } from '../src/domain/entities/enums';
import { AbstractBcryptService } from '../src/domain/services';
import { clearDynamoDBTable } from './common/clear-dynamodb-table';
import { e2eSetup } from './common/e2e-setup';
import { e2eTearDown } from './common/e2e-tear-down';

describe('ShortLink (e2e)', () => {
  let module: TestingModule;
  let app: INestApplication;
  // let shortLinkRepository: MockShortLinkRepository;

  let shortLinkRepository: AbstractShortLinkRepository;
  let userRepository: AbstractUserRepository;
  let jwtService: JwtService;
  let bcryptService: AbstractBcryptService;
  let accessToken: string;
  let adminUser: any;

  beforeEach(async () => {
    // Clear DynamoDB table before each test to avoid data pollution
    await clearDynamoDBTable('ShortLink');

    // Note: e2eSetup creates a compiled module, so we can't override providers
    const setup = await e2eSetup();
    module = setup.module;
    app = setup.app;

    userRepository = module.get<AbstractUserRepository>(AbstractUserRepository);
    shortLinkRepository = module.get<AbstractShortLinkRepository>(
      AbstractShortLinkRepository
    );
    jwtService = module.get<JwtService>(JwtService);
    bcryptService = module.get<AbstractBcryptService>(AbstractBcryptService);

    // Create an admin user for testing
    const hashedPassword = await bcryptService.hash('admin123');
    adminUser = await userRepository.create({
      username: 'adminuser',
      password: hashedPassword
    });

    // Manually update the role to admin (since create doesn't support role)
    await userRepository.updateOne({
      findOneUser: { id: adminUser.id },
      updateUser: { role: Role.Admin }
    });

    // Generate a valid JWT token for the admin user
    const payload = {
      sub: adminUser.id,
      username: 'adminuser',
      email: null,
      roles: [Role.Admin]
    };
    accessToken = await jwtService.signAsync(payload);
  });

  afterEach(async () => {
    await e2eTearDown(app);
    jest.clearAllMocks();
    MockDate.reset();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
  });

  describe('POST /v1/shortlinks', () => {
    it('should return 201 Created when successfully creating a shortlink as a signed user', async () => {
      MockDate.set('2025-04-19T08:00:00.000');

      const createShortLinkDto = {
        originalUrl: 'https://example.com/very-long-url'
      };

      const response = await request(app.getHttpServer())
        .post('/v1/shortlinks')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send(createShortLinkDto)
        .expect(201);

      expect(response.body).toEqual({
        data: expect.objectContaining({
          GSI1PK: expect.any(String),
          GSI1SK: expect.any(String),
          PK: expect.any(String),
          SK: expect.any(String),
          clicks: 0,
          createdAt: expect.any(String),
          originalUrl: 'https://example.com/very-long-url',
          shortCode: expect.any(String),
          status: true,
          updatedAt: expect.any(String)
        }),
        message: 'Success',
        statusCode: 201,
        timestamp: expect.any(String)
      });
    });

    it('should return 400 Bad Request when originalUrl is missing', async () => {
      const response = await request(app.getHttpServer())
        .post('/v1/shortlinks')
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({})
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('GET /v1/shortlinks', () => {
    it('should return 200 OK and all shortlinks for the user', async () => {
      MockDate.set('2025-04-19T08:00:00.000');

      // Create test data
      await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/url1'
      });
      await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/url2'
      });

      const response = await request(app.getHttpServer())
        .get('/v1/shortlinks')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body.data).toHaveProperty('items');
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            originalUrl: 'https://example.com/url1',
            shortCode: expect.any(String)
          }),
          expect.objectContaining({
            originalUrl: 'https://example.com/url2',
            shortCode: expect.any(String)
          })
        ])
      );
    });

    it('should return 200 OK and only active shortlinks when active=true', async () => {
      MockDate.set('2025-04-19T08:00:00.000');

      // Create active shortlink
      const active = await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/active'
      });

      // Create inactive shortlink
      const inactive = await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/inactive'
      });

      await shortLinkRepository.updateOne(
        { userId: adminUser.id, shortCode: inactive.shortCode },
        { status: false }
      );

      const response = await request(app.getHttpServer())
        .get('/v1/shortlinks?active=true')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0]).toMatchObject({
        originalUrl: 'https://example.com/active',
        status: true
      });
    });

    it('should support pagination with limit', async () => {
      MockDate.set('2025-04-19T08:00:00.000');

      // Create multiple shortlinks
      for (let i = 0; i < 15; i++) {
        await shortLinkRepository.create({
          userId: adminUser.id,
          originalUrl: `https://example.com/url${i}`
        });
      }

      const response = await request(app.getHttpServer())
        .get('/v1/shortlinks?limit=5')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body.data.items).toHaveLength(5);
    });
  });

  describe('GET /v1/shortlinks/:shortCode', () => {
    it('should return 200 OK and the shortlink data', async () => {
      MockDate.set('2025-04-19T08:00:00.000');

      const created = await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/test'
      });

      const response = await request(app.getHttpServer())
        .get(`/v1/shortlinks/${created.shortCode}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body).toEqual({
        data: expect.objectContaining({
          shortCode: created.shortCode,
          originalUrl: 'https://example.com/test',
          clicks: 0,
          status: true
        }),
        message: 'Success',
        statusCode: 200,
        timestamp: expect.any(String)
      });
    });

    it('should return 404 Not Found for non-existent shortCode', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/shortlinks/nonexistent')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });

  describe('GET /v1/shortlinks/:shortCode/redirect', () => {
    it('should redirect to the original URL', async () => {
      MockDate.set('2025-04-19T08:00:00.000');

      const created = await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/redirect-target'
      });

      const response = await request(app.getHttpServer())
        .get(`/v1/shortlinks/${created.shortCode}/redirect`)
        .expect(302);

      expect(response.headers.location).toBe(
        'https://example.com/redirect-target'
      );
    });

    it('should return 404 for non-existent shortCode', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/shortlinks/nonexistent/redirect')
        .expect(404);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PATCH /v1/shortlinks/:shortCode/activate', () => {
    it('should activate an inactive shortlink', async () => {
      MockDate.set('2025-04-19T08:00:00.000');

      const created = await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/test'
      });

      // Deactivate first
      await shortLinkRepository.updateOne(
        { userId: adminUser.id, shortCode: created.shortCode },
        { status: false }
      );

      const response = await request(app.getHttpServer())
        .patch(`/v1/shortlinks/${created.shortCode}/activate`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body).toBeDefined();

      // Verify it's activated
      const updated = await shortLinkRepository.findOneBy({
        userId: adminUser.id,
        shortCode: created.shortCode
      });
      expect(updated.status).toBe(true);
    });
  });

  describe('PATCH /v1/shortlinks/:shortCode/deactivate', () => {
    it('should deactivate an active shortlink', async () => {
      MockDate.set('2025-04-19T08:00:00.000');

      const created = await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/test'
      });

      const response = await request(app.getHttpServer())
        .patch(`/v1/shortlinks/${created.shortCode}/deactivate`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body).toBeDefined();

      // Verify it's deactivated
      const updated = await shortLinkRepository.findOneBy({
        userId: adminUser.id,
        shortCode: created.shortCode
      });
      expect(updated.status).toBe(false);
    });
  });

  describe('PATCH /v1/shortlinks/:shortCode/extend', () => {
    it('should extend the expiry date by specified days', async () => {
      MockDate.set('2025-04-19T08:00:00.000');

      const created = await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/test'
      });

      const originalExpiry = created.expiresAt;

      const response = await request(app.getHttpServer())
        .patch(`/v1/shortlinks/${created.shortCode}/extend`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({ days: 7 })
        .expect(200);

      expect(response.body).toBeDefined();

      // Verify expiry is extended
      const updated = await shortLinkRepository.findOneBy({
        userId: adminUser.id,
        shortCode: created.shortCode
      });
      expect(updated.expiresAt).toBeGreaterThan(originalExpiry);
    });

    it('should return 400 Bad Request when days is invalid', async () => {
      const created = await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/test'
      });

      const response = await request(app.getHttpServer())
        .patch(`/v1/shortlinks/${created.shortCode}/extend`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .send({ days: 'invalid' })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('DELETE /v1/shortlinks/:shortCode', () => {
    it('should delete a shortlink', async () => {
      MockDate.set('2025-04-19T08:00:00.000');

      const created = await shortLinkRepository.create({
        userId: adminUser.id,
        originalUrl: 'https://example.com/test'
      });

      const response = await request(app.getHttpServer())
        .delete(`/v1/shortlinks/${created.shortCode}`)
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(200);

      expect(response.body).toEqual({
        message: 'Success',
        statusCode: 200,
        timestamp: expect.any(String)
      });

      // Verify it's deleted
      const exist = await shortLinkRepository.isExist({
        userId: adminUser.id,
        shortCode: created.shortCode
      });
      expect(exist).toBe(false);
    });

    it('should return 404 for non-existent shortCode', async () => {
      const response = await request(app.getHttpServer())
        .delete('/v1/shortlinks/nonexistent')
        .set('Cookie', [`accessToken=${accessToken}`])
        .expect(404);

      expect(response.body.statusCode).toBe(404);
    });
  });
});
