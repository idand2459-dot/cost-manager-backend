const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const userRoutes = require('../users-service/routes/user.routes');

const app = express();
app.use(express.json());
app.use('/api', userRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /api/users', () => {
  test('should return array of users with status 200', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('each user should have required fields', async () => {
    const res = await request(app).get('/api/users');
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('first_name');
      expect(res.body[0]).toHaveProperty('last_name');
      expect(res.body[0]).toHaveProperty('birthday');
    }
  });
});

describe('GET /api/users/:id', () => {
  test('should return user details with total for existing user', async () => {
    const res = await request(app).get('/api/users/123123');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 123123);
    expect(res.body).toHaveProperty('first_name');
    expect(res.body).toHaveProperty('last_name');
    expect(res.body).toHaveProperty('birthday');
    expect(res.body).toHaveProperty('total');
  });

  test('should return 404 for non-existing user', async () => {
    const res = await request(app).get('/api/users/999999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });
});

describe('POST /api/users', () => {
  test('should return 409 if user already exists', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ id: 123123, first_name: 'mosh', last_name: 'israeli', birthday: '1990-01-01' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('message');
  });

  test('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ id: 111111 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });
});