require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createLogger } = require('../shared/logger');
const { logger, httpLogger } = createLogger('logs-service');

const express = require('express');
const mongoose = require('mongoose');
const logRoutes = require('./routes/log.routes');

const app = express();
app.use(httpLogger);
app.use(express.json());
app.use('/api', logRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Logs Service connected to MongoDB');
    const port = process.env.LOGS_PORT || 3001;
    app.listen(port, () => logger.info(`Logs Service running on port ${port}`));
  })
  .catch((err) => {
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  });
