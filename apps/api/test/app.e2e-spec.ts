import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module.js';
import { JwtService } from '@nestjs/jwt';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    jwtService = app.get(JwtService);
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/work-orders (GET) rejects requests without a token', () => {
    return request(app.getHttpServer()).get('/work-orders').expect(401);
  });

  it('/work-orders (GET) accepts a valid token', async () => {
    const accessToken = await jwtService.signAsync({
      sub: 'test-user-id',
      role: 'technician',
    });

    const response = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
  });

  afterEach(async () => {
    await app.close();
  });
});
