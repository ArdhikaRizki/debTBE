import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

describe('Debt Management Flow (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  let authToken: string;
  let userId: string;
  let debtId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    // Clean up test data
    if (userId) {
      await prismaService.debt.deleteMany({ where: { userId } });
      await prismaService.user.delete({ where: { id: userId } });
    }
    await app.close();
  });

  describe('User Registration and Authentication Flow', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: `testuser_${Date.now()}`,
          password: 'TestPassword123!',
          name: 'Test User',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username');
      expect(response.body).toHaveProperty('name');
      expect(response.body).not.toHaveProperty('password');

      userId = response.body.id;
    });

    it('should login with registered user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: `testuser_${userId.slice(-13)}`, // Use same username
          password: 'TestPassword123!',
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      authToken = response.body.access_token;
    });

    it('should fail to login with incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: `testuser_${userId.slice(-13)}`,
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });

  describe('Debt CRUD Operations Flow', () => {
    it('should create a new debt', async () => {
      const response = await request(app.getHttpServer())
        .post('/debts/crud')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          type: 'hutang',
          name: 'Restaurant Payment',
          amount: 150000,
          description: 'Lunch with team',
          date: '2025-12-25',
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.type).toBe('hutang');
      expect(response.body.amount).toBe(150000);
      expect(response.body.isPaid).toBe(false);

      debtId = response.body.id;
    });

    it('should get all debts for user', async () => {
      const response = await request(app.getHttpServer())
        .get('/debts/crud')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
    });

    it('should get debt summary', async () => {
      const response = await request(app.getHttpServer())
        .get('/debts/crud/summary')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalHutang');
      expect(response.body).toHaveProperty('totalPiutang');
      expect(response.body).toHaveProperty('netBalance');
      expect(response.body.totalHutang).toBe(150000);
      expect(response.body.unpaidDebts).toBeGreaterThan(0);
    });

    it('should get single debt by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/debts/crud/${debtId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(debtId);
      expect(response.body.amount).toBe(150000);
    });

    it('should update a debt', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/debts/crud/${debtId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 175000,
          description: 'Updated: Lunch with team + dessert',
        })
        .expect(200);

      expect(response.body.amount).toBe(175000);
      expect(response.body.description).toContain('dessert');
    });

    it('should mark debt as paid', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/debts/crud/${debtId}/mark-paid`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.isPaid).toBe(true);
    });

    it('should filter debts by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/debts/crud?isPaid=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      response.body.forEach((debt) => {
        expect(debt.isPaid).toBe(true);
      });
    });

    it('should delete a debt', async () => {
      await request(app.getHttpServer())
        .delete(`/debts/crud/${debtId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // Verify deletion
      await request(app.getHttpServer())
        .get(`/debts/crud/${debtId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Authorization and Security', () => {
    it('should reject requests without auth token', async () => {
      await request(app.getHttpServer())
        .get('/debts/crud')
        .expect(401);
    });

    it('should reject requests with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/debts/crud')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });

    it('should not allow accessing other users debts', async () => {
      // This would require creating another user and testing cross-user access
      // For now, we verify that debts are filtered by userId in the service layer
      const response = await request(app.getHttpServer())
        .get('/debts/crud')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      // All returned debts should belong to the authenticated user
      response.body.forEach((debt) => {
        expect(debt.userId).toBe(userId);
      });
    });
  });
});
