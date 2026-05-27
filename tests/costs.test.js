const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const costRoutes = require('../costs-service/routes/cost.routes');

const app = express();
app.use(express.json());
app.use('/api', costRoutes);

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/add', () => {
  test('should add a cost item and return 201', async () => {
    const res = await request(app)
      .post('/api/add')
      .send({ userid: 123123, description: 'test item', category: 'food', sum: 10 });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('userid', 123123);
    expect(res.body).toHaveProperty('description', 'test item');
    expect(res.body).toHaveProperty('category', 'food');
    expect(res.body).toHaveProperty('sum', 10);
  });

  test('should return 400 if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/add')
      .send({ userid: 123123 });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });

  test('should return 404 if userid does not exist', async () => {
    const res = await request(app)
      .post('/api/add')
      .send({ userid: 999999, description: 'ghost', category: 'food', sum: 5 });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('id', 'user-not-found');
  });
});

describe('GET /api/report', () => {
  test('should return a report with correct structure', async () => {
    const now = new Date();
    const res = await request(app)
      .get(`/api/report?id=123123&year=${now.getFullYear()}&month=${now.getMonth() + 1}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('userid', 123123);
    expect(res.body).toHaveProperty('year');
    expect(res.body).toHaveProperty('month');
    expect(res.body).toHaveProperty('costs');
    expect(Array.isArray(res.body.costs)).toBe(true);
  });

  test('should return 400 if params are missing', async () => {
    const res = await request(app).get('/api/report?id=123123');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });

  test('should include all 5 categories in costs array', async () => {
    const now = new Date();
    const res = await request(app)
      .get(`/api/report?id=123123&year=${now.getFullYear()}&month=${now.getMonth() + 1}`);

    const keys = res.body.costs.map((c) => Object.keys(c)[0]);
    expect(keys).toContain('food');
    expect(keys).toContain('education');
    expect(keys).toContain('health');
    expect(keys).toContain('housing');
    expect(keys).toContain('Sport');
  });
});