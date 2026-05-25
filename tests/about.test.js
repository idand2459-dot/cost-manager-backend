const request = require('supertest');
const app = require('../about-service/app');

// ─── GET /api/about ───────────────────────────────────────────────────────────

describe('GET /api/about', () => {
  it('returns an array of team members', async () => {
    const res = await request(app).get('/api/about');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('each team member has first_name and last_name', async () => {
    const res = await request(app).get('/api/about');
    expect(res.status).toBe(200);
    res.body.forEach((member) => {
      expect(member).toHaveProperty('first_name');
      expect(member).toHaveProperty('last_name');
    });
  });
});
