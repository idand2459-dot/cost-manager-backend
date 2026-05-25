const request = require('supertest');

jest.mock('../logs-service/models/log.model', () => ({
  find: jest.fn(),
}));

const Log = require('../logs-service/models/log.model');
const app = require('../logs-service/app');

beforeEach(() => jest.clearAllMocks());

// ─── GET /api/logs ────────────────────────────────────────────────────────────

describe('GET /api/logs', () => {
  it('returns all logs as an array', async () => {
    const mockLogs = [
      { level: 30, time: 1700000002000, msg: 'GET /api/report - 200', service: 'costs-service' },
      { level: 30, time: 1700000001000, msg: 'POST /api/add - 201',   service: 'costs-service' },
    ];
    Log.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(mockLogs) });

    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
  });

  it('returns an empty array when no logs exist', async () => {
    Log.find.mockReturnValue({ sort: jest.fn().mockResolvedValue([]) });

    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns error response with id and message on failure', async () => {
    Log.find.mockReturnValue({
      sort: jest.fn().mockRejectedValue(new Error('DB connection lost')),
    });

    const res = await request(app).get('/api/logs');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });
});
