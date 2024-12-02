import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';

describe('Client E2E', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await dataSource.dropDatabase();
    await app.close();
  });

  describe('Parking Routes', () => {
    it('/parking/status (GET) - should return parking status', async () => {
      const response = await request(app.getHttpServer()).get(
        '/parking/status',
      );
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
    });

    it('/parking/reserve (POST) - should reserve a parking spot', async () => {
      const reservationDto = {
        userId: 'user123',
        spotId: 'A1',
        name: 'John',
        surname: 'Doe',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 600000).toISOString(),
        vehicleType: 'combustion',
        licensePlate: 'ABC123',
      };

      const response = await request(app.getHttpServer())
        .post('/parking/reserve')
        .send(reservationDto);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status', 'pending');
    });

    it('/parking/reserve (POST) - should return error for unavailable spot', async () => {
      const reservationDto = {
        userId: 'user123',
        spotId: 'A1',
        name: 'John',
        surname: 'Doe',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 600000).toISOString(),
        vehicleType: 'combustion',
        licensePlate: 'ABC123',
      };

      await request(app.getHttpServer())
        .post('/reservation/reserve')
        .send(reservationDto);

      const response = await request(app.getHttpServer())
        .post('/reservation/reserve')
        .send(reservationDto);

      expect(response.status).toBe(409);
      expect(response.body.message).toContain('is already reserved');
    });
  });
});
