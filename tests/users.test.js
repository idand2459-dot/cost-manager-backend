const request = require('supertest');

jest.mock('../users-service/models/user.model', () => ({
  create:  jest.fn(),
  find:    jest.fn(),
  findOne: jest.fn(),
}));
jest.mock('../users-service/models/cost-ref.model', () => ({
  aggregate: jest.fn(),
}));

const User    = require('../users-service/models/user.model');
const CostRef = require('../users-service/models/cost-ref.model');
const app     = require('../users-service/app');

beforeEach(() => jest.clearAllMocks());

// ─── POST /api/users ──────────────────────────────────────────────────────────

describe('POST /api/users', () => {
  const validPayload = {
    id:         1,
    first_name: 'John',
    last_name:  'Doe',
    birthday:   '1990-01-01',
  };

  it('returns 201 with the created user', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ ...validPayload, _id: 'abc' });

    const res = await request(app).post('/api/users').send(validPayload);
    expect(res.status).toBe(201);
  });

  it('returns 409 for a duplicate user id', async () => {
    User.findOne.mockResolvedValue({ id: 1 });

    const res = await request(app).post('/api/users').send(validPayload);
    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });

  it('returns 400 when required fields are missing', async () => {
    const res = await request(app).post('/api/users').send({ id: 1 });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });
});

// ─── GET /api/users ───────────────────────────────────────────────────────────

describe('GET /api/users', () => {
  it('returns the list of all users', async () => {
    User.find.mockResolvedValue([
      { id: 1, first_name: 'John', last_name: 'Doe', birthday: new Date('1990-01-01') },
    ]);

    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  it('returns an empty array when no users exist', async () => {
    User.find.mockResolvedValue([]);
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

// ─── GET /api/users/:id ───────────────────────────────────────────────────────

describe('GET /api/users/:id', () => {
  const mockUser = {
    id:         1,
    first_name: 'John',
    last_name:  'Doe',
    birthday:   new Date('1990-01-01'),
  };

  it('returns user details including birthday and total costs', async () => {
    User.findOne.mockResolvedValue(mockUser);
    CostRef.aggregate.mockResolvedValue([{ _id: null, total: 250 }]);

    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(1);
    expect(res.body.total).toBe(250);
    expect(res.body).toHaveProperty('birthday');
    expect(res.body).toHaveProperty('first_name');
    expect(res.body).toHaveProperty('last_name');
  });

  it('returns total 0 when the user has no costs', async () => {
    User.findOne.mockResolvedValue(mockUser);
    CostRef.aggregate.mockResolvedValue([]);

    const res = await request(app).get('/api/users/1');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(0);
  });

  it('returns 404 when the user does not exist', async () => {
    User.findOne.mockResolvedValue(null);

    const res = await request(app).get('/api/users/999');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('message');
  });
});
