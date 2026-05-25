const express = require('express');
const { createLogger, mongoRequestLogger } = require('../shared/logger');
const userRoutes = require('./routes/user.routes');

const { httpLogger } = createLogger('users-service');

const app = express();
app.use(httpLogger);
app.use(mongoRequestLogger('users-service'));
app.use(express.json());
app.use('/api', userRoutes);

module.exports = app;
