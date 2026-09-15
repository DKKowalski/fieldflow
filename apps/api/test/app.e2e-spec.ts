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
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'technician',
    });

    const response = await request(app.getHttpServer())
      .get('/work-orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
  });

  it('/work-orders (POST) rejects a technician', async () => {
    const accessToken = await jwtService.signAsync({
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'technician',
    });

    await request(app.getHttpServer())
      .post('/work-orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Repair air conditioner',
        serviceLocationId: '00000000-0000-4000-8000-000000000002',
      })
      .expect(403);
  });

  it('/work-orders/:id/schedule (PATCH) rejects an invalid time range', async () => {
    const accessToken = await jwtService.signAsync({
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'dispatcher',
    });

    const response = await request(app.getHttpServer())
      .patch('/work-orders/00000000-0000-4000-8000-000000000002/schedule')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        scheduledStartAt: '2026-09-15T11:00:00.000Z',
        scheduledEndAt: '2026-09-15T09:00:00.000Z',
      })
      .expect(400);

    expect(response.body.message).toBe(
      'Scheduled end time must be later than scheduled start time',
    );
  });

  it('/customers (GET) rejects a technician', async () => {
    const accessToken = await jwtService.signAsync({
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'technician',
    });

    await request(app.getHttpServer())
      .get('/customers')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('/service-locations (GET) rejects a technician', async () => {
    const accessToken = await jwtService.signAsync({
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'technician',
    });

    await request(app.getHttpServer())
      .get('/service-locations')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('/service-locations/:id (PATCH) rejects customer reassignment', async () => {
    const accessToken = await jwtService.signAsync({
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'dispatcher',
    });

    const response = await request(app.getHttpServer())
      .patch('/service-locations/00000000-0000-4000-8000-000000000002')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        customerId: '00000000-0000-4000-8000-000000000003',
      })
      .expect(400);

    expect(response.body.message).toContain(
      'property customerId should not exist',
    );
  });

  it('/users (GET) rejects requests without a token', () => {
    return request(app.getHttpServer()).get('/users').expect(401);
  });

  it('/users (GET) rejects a technician', async () => {
    const accessToken = await jwtService.signAsync({
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'technician',
    });

    await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(403);
  });

  it('/users (GET) accepts a dispatcher', async () => {
    const accessToken = await jwtService.signAsync({
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'dispatcher',
    });

    const response = await request(app.getHttpServer())
      .get('/users')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(response.body).toEqual(expect.any(Array));
  });

  it('/users (GET) rejects an invalid role filter', async () => {
    const accessToken = await jwtService.signAsync({
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'dispatcher',
    });

    await request(app.getHttpServer())
      .get('/users?role=customer')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('/service-locations (GET) rejects an invalid customer filter', async () => {
    const accessToken = await jwtService.signAsync({
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'dispatcher',
    });

    await request(app.getHttpServer())
      .get('/service-locations?customerId=not-a-uuid')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  it('/work-orders (GET) rejects an invalid status filter', async () => {
    const accessToken = await jwtService.signAsync({
      sub: '00000000-0000-4000-8000-000000000001',
      role: 'dispatcher',
    });

    await request(app.getHttpServer())
      .get('/work-orders?status=unknown')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400);
  });

  afterEach(async () => {
    await app.close();
  });
});
