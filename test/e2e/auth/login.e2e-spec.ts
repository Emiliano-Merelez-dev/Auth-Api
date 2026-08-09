import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { App } from 'supertest/types';

describe('Auth register and login (e2e)', () => {
  let app: INestApplication;
  let server: App;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    server = app.getHttpServer() as App;
  }, 30000);

  it('should return 400 Bad Request when registering with an empty body', async () => {
    const response = await request(server).post('/api/auth/register').send({});

    expect(response.status).toBe(400);
    expect(response.body.statusCode).toBe(400);
  });

  it('/api/auth/register (POST) - should return 400 with validation errors when sending invalid data', async () => {
    const response = await request(server).post('/api/auth/register').send({
      email: 'esto-no-es-un-email',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'email must be an email',
        'password must be longer than or equal to 8 characters',
      ]),
    );
  });

  it('/api/auth/register (POST) - should register a new user successfully with valid data', async () => {
    const uniqueEmail = `test_${Date.now()}@test.com`;
    const response = await request(server).post('/api/auth/register').send({
      email: uniqueEmail,
      password: 'StrongPassword123!',
    });

    expect(response.status).toBe(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
          email: expect.any(String),
          isVerified: false,
          createdAt: expect.any(String),
          roles: expect.arrayContaining([
            expect.objectContaining({
              id: expect.stringMatching(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
              ),
              name: 'user',
            }),
          ]),
        }),
        verificationToken: expect.any(String),
      }),
    );
  });

  it('/api/auth/login (POST) - should return 400 with validation errors when sending invalid data', async () => {
    const response = await request(server).post('/api/auth/login').send({
      email: 'esto-no-es-un-email',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toEqual(
      expect.arrayContaining([
        'email must be an email',
        'password must be longer than or equal to 8 characters',
      ]),
    );
  });

  it('/api/auth/login (POST) - should login successfully with valid credentials', async () => {
    const credentials = {
      email: 'testPass@gmail.com',
      password: 'StrongPassword123!',
    };

    await request(server).post('/api/auth/register').send(credentials);

    const response = await request(server)
      .post('/api/auth/login')
      .send(credentials);

    expect(response.status).toBe(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
          ),
          email: 'testPass@gmail.com',
          isVerified: false,
          createdAt: expect.any(String),
          roles: expect.arrayContaining([
            expect.objectContaining({
              id: expect.stringMatching(
                /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
              ),
              name: 'user',
            }),
          ]),
        }),
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    );
  });
});
