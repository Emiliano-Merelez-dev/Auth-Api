import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../../src/app.module';
import { App } from 'supertest/types';
import { AuthGuard } from '@nestjs/passport';

class MockGoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    req.user = {
      id: 'f84f8b71-2027-4da3-b95d-2175b1cb3999',
      email: `google_test_${Date.now()}@test.com`,
      isVerified: true,
      roles: [{ id: 'f84f8b71-2027-4da3-b95d-2175b1cb3909', name: 'user' }],
    };
    return Promise.resolve(true);
  }
}

describe('Google Auth (e2e)', () => {
  let app: INestApplication;
  let server: App;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard('google'))
      .useClass(MockGoogleAuthGuard)
      .compile();

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

  it('/api/auth/google/callback (GET) - should simulate google login and return tokens', async () => {
    const response = await request(server).get('/api/auth/google/callback');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'Google login successful',
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
        user: expect.objectContaining({
          email: expect.stringContaining('@test.com'),
          isVerified: true,
        }),
      }),
    );
  });
});
