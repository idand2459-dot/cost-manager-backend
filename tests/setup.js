// Environment stubs for tests — no real MongoDB connection needed
// because all Mongoose models are mocked at the module level in each test file.
process.env.MONGO_URI = 'mongodb://localhost:27017/test-placeholder';
process.env.PORT       = '3000';
process.env.COSTS_PORT = '3003';
process.env.LOGS_PORT  = '3001';
process.env.ABOUT_PORT = '3002';
