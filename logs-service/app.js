const express = require('express');
const { createLogger } = require('../shared/logger');
const logRoutes = require('./routes/log.routes');

const { httpLogger } = createLogger('logs-service');

const app = express();
app.use(httpLogger);
app.use(express.json());
app.use('/api', logRoutes);

module.exports = app;
