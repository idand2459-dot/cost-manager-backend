const express = require('express');
const { createLogger, mongoRequestLogger } = require('../shared/logger');
const costRoutes = require('./routes/cost.routes');

const { httpLogger } = createLogger('costs-service');

const app = express();
app.use(httpLogger);
app.use(mongoRequestLogger('costs-service'));
app.use(express.json());
app.use('/api', costRoutes);

module.exports = app;
