const request = require('supertest');

jest.mock('../costs-service/models/cost.model', () => ({
  create:  jest.fn(),
  find:    jest.fn(),
  findOne: jest.fn(),
}));
jest.mock('../costs-service/models/computed-report.model', () => ({
  findOne:          jest.fn(),
  findOneAndUpdate: jest.fn(),
}));
jest.mock('../costs-service/models/user-ref.model', () => ({
  findOne: jest.fn(),
}));

const Cost           = require('../costs-service/models/cost.model');
const ComputedReport = require('../costs-service/models/computed-report.model');
const UserRef        = require('../costs-service/models/user-ref.model');
const app            = require('../costs-service/app');

beforeEach(() => jest.clearAllMocks());

// ─── POST /api/add ────────────────────────────────────────────────────────────

describe('POST /api/add', () => {
  const validPayload = {
    userid:      1,
    description: 'groceries',
    category:    'food',
    sum:         50,
  };

  it('returns 201 with the created cost', async () => {
    UserRef.findOne.mockResolvedValue({ id: 1 });
    Cost.create.mockResolvedValue({ ...validPayload, created_at: new Date(), _id: 'abc' });

    const res = await request(app).post('/api/add').send(validPayload);
    expect(res.status).toBe(201);
    expect(res.body.userid).toBe(1);
    expect(res.body.category).toBe('food');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/add').send({ userid: 1, category: 'food' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });

  it('returns 400 for an invalid category', async () => {
    const res = await request(app).post('/api/add').send({ ...validPayload, category: 'gambling' });
    expect(res.status).toBe(400);
    expect(res.body.id).toBe('invalid-category');
  });

  it('returns 404 when the userid does not exist', async () => {
    UserRef.findOne.mockResolvedValue(null);
    const res = await request(app).post('/api/add').send(validPayload);
    expect(res.status).toBe(404);
    expect(res.body.id).toBe('user-not-found');
  });

  it('returns 400 for a past date', async () => {
    UserRef.findOne.mockResolvedValue({ id: 1 });
    const res = await request(app).post('/api/add').send({
      ...validPayload,
      created_at: '2020-01-01T00:00:00.000Z',
    });
    expect(res.status).toBe(400);
    expect(res.body.id).toBe('invalid-date');
  });
});

// ─── GET /api/report ──────────────────────────────────────────────────────────

describe('GET /api/report', () => {
  it('returns an empty report containing all five categories', async () => {
    ComputedReport.findOne.mockResolvedValue(null);
    Cost.find.mockResolvedValue([]);
    ComputedReport.findOneAndUpdate.mockResolvedValue({});

    const now = new Date();
    const res = await request(app).get(
      `/api/report?id=1&year=${now.getFullYear()}&month=${now.getMonth() + 1}`
    );
    expect(res.status).toBe(200);
    ['food', 'education', 'health', 'housing', 'sports'].forEach((cat) => {
      expect(res.body).toHaveProperty(cat);
      expect(Array.isArray(res.body[cat])).toBe(true);
    });
  });

  it('serves a cached report for a past month without querying costs', async () => {
    const cachedReport = {
      food: [{ sum: 100, description: 'groceries', day: 5 }],
      education: [], health: [], housing: [], sports: [],
    };
    ComputedReport.findOne.mockResolvedValue({ report: cachedReport });

    const res = await request(app).get('/api/report?id=1&year=2020&month=6');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(cachedReport);
    expect(Cost.find).not.toHaveBeenCalled();
  });

  it('builds and caches a report for a new past month', async () => {
    ComputedReport.findOne.mockResolvedValue(null);
    Cost.find.mockResolvedValue([
      { sum: 80, description: 'rent', category: 'housing', created_at: new Date('2020-06-15') },
    ]);
    ComputedReport.findOneAndUpdate.mockResolvedValue({});

    const res = await request(app).get('/api/report?id=1&year=2020&month=6');
    expect(res.status).toBe(200);
    expect(res.body.housing).toHaveLength(1);
    expect(res.body.housing[0].sum).toBe(80);
    expect(ComputedReport.findOneAndUpdate).toHaveBeenCalled();
  });

  it('returns 400 when a required query param is missing', async () => {
    const res = await request(app).get('/api/report?id=1&year=2025');
    expect(res.status).toBe(400);
    expect(res.body.id).toBe('invalid-params');
  });

  it('returns 400 when a query param is non-numeric', async () => {
    const res = await request(app).get('/api/report?id=abc&year=2025&month=1');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });
});
