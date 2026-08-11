import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { App } from 'supertest/types';

describe('Auth Refresh Token (e2e)', () => {
  let app: INestApplication;
  let server: App;

  beforeAll(async () => {
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
  });

  afterAll(async () => {
    await app.close(); // Cerramos bien la app para evitar fugas de conexiones o timers colgados
  });

  it('/api/auth/refresh (POST) - should refresh access token successfully with a valid refresh token', async () => {
    const refreshEmail = `refresh_${Date.now()}@test.com`;
    const password = 'StrongPassword123!';

    // 1. Registramos un usuario nuevo al vuelo
    await request(server).post('/api/auth/register').send({
      email: refreshEmail,
      password,
    });

    // 2. Nos logueamos para extraer el refreshToken real
    const loginResponse = await request(server).post('/api/auth/login').send({
      email: refreshEmail,
      password,
    });

    const { refreshToken } = loginResponse.body;

    // 3. Le pegamos al endpoint de refresh mandándole el token
    const refreshResponse = await request(server)
      .post('/api/auth/refresh')
      .send({
        refreshToken: refreshToken,
      });

    // 4. Validamos que devuelva éxito y un nuevo accessToken
    expect(refreshResponse.status).toBeGreaterThanOrEqual(201);
    expect(refreshResponse.status).toBeLessThan(300);

    expect(refreshResponse.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
      }),
    );
  });
});
