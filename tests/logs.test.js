const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const logRoutes = require('../logs-service/routes/log.routes');

const app = express();
app.use(express.json());
app.use('/api', logRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('GET /api/logs', () => {
  test('should return array of logs with status 200', async () => {
    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('each log should have required fields', async () => {
    const res = await request(app).get('/api/logs');
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('msg');
      expect(res.body[0]).toHaveProperty('time');
      expect(res.body[0]).toHaveProperty('level');
    }
  });
});