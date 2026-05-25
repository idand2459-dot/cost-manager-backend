const express = require('express');
const { createLogger, mongoRequestLogger } = require('../shared/logger');
const aboutRoutes = require('./routes/about.routes');

const { httpLogger } = createLogger('about-service');

const app = express();
app.use(httpLogger);
app.use(mongoRequestLogger('about-service'));
app.use(express.json());
app.use('/api', aboutRoutes);

module.exports = app;
