require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createLogger, mongoRequestLogger } = require('../shared/logger');
const { logger, httpLogger } = createLogger('costs-service');

const express = require('express');
const mongoose = require('mongoose');
const costRoutes = require('./routes/cost.routes');

const app = express();
app.use(httpLogger);
app.use(mongoRequestLogger('costs-service'));
app.use(express.json());
app.use('/api', costRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Costs Service connected to MongoDB');
    const port = process.env.COSTS_PORT || 3003;
    app.listen(port, () => logger.info(`Costs Service running on port ${port}`));
  })
  .catch((err) => {
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  });
