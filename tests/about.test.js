const request = require('supertest');
const express = require('express');

const aboutRoutes = require('../about-service/routes/about.routes');

const app = express();
app.use(express.json());
app.use('/api', aboutRoutes);

describe('GET /api/about', () => {
  test('should return array of team members with status 200', async () => {
    const res = await request(app).get('/api/about');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('each member should have only first_name and last_name', async () => {
    const res = await request(app).get('/api/about');
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    res.body.forEach((member) => {
      expect(member).toHaveProperty('first_name');
      expect(member).toHaveProperty('last_name');
      expect(Object.keys(member).length).toBe(2);
    });
  });
});