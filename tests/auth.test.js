import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';

process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

import app from '../app.js';
import User from '../models/User.js';

jest.setTimeout(120000);

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  await User.create({ email: 'user@example.com', password: 'password123' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
  await User.create({ email: 'user@example.com', password: 'password123' });
});

describe('POST /api/auth/login', () => {
  test('returns a JWT for valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'USER@example.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
    expect(jwt.verify(response.body.token, 'test-secret')).toMatchObject({
      email: 'user@example.com',
    });
  });

  test('rejects invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid email or password' });
  });

  test('rejects an incomplete request', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: 'Email and password are required' });
  });
});
