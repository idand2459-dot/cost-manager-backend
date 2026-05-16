require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createLogger } = require('../shared/logger');
const { logger, httpLogger } = createLogger('about-service');

const express = require('express');
const aboutRoutes = require('./routes/about.routes');

const app = express();
app.use(httpLogger);
app.use(express.json());
app.use('/api', aboutRoutes);

const port = process.env.ABOUT_PORT || 3002;
app.listen(port, () => logger.info(`About Service running on port ${port}`));
