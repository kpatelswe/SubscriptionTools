import request from 'supertest';
import app from '../app.js';

describe('Auth Endpoints', () => {
  const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'password123',
  };

  describe('POST /api/v1/auth/sign-up', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-up')
        .send({ email: 'test@example.com' }); // missing name and password

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
      expect(res.body.errors).toBeDefined();
    });

    it('should return 400 for an invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-up')
        .send({
          name: 'Test User',
          email: 'not-an-email',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
        ])
      );
    });

    it('should return 400 for a password that is too short', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-up')
        .send({
          name: 'Test User',
          email: 'valid@example.com',
          password: '123', // too short
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'password' }),
        ])
      );
    });
  });

  describe('POST /api/v1/auth/sign-in', () => {
    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-in')
        .send({ password: 'password123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });

    it('should return 400 if password is missing', async () => {
      const res = await request(app)
        .post('/api/v1/auth/sign-in')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Validation failed');
    });
  });
});

describe('Subscription Endpoints', () => {
  describe('POST /api/v1/subscriptions', () => {
    it('should return 401 if no auth token is provided', async () => {
      const res = await request(app)
        .post('/api/v1/subscriptions')
        .send({
          name: 'Netflix',
          price: 15.99,
          frequency: 'monthly',
          category: 'Entertainment',
          paymentMethod: 'Credit Card',
          startDate: '2024-01-01',
        });

      expect(res.statusCode).toBe(401);
    });
  });
});

describe('Health Check', () => {
  it('GET /api/v1/health should return 200', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.statusCode).toBe(200);
  });
});
