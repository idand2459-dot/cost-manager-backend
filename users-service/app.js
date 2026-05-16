require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createLogger, mongoRequestLogger } = require('../shared/logger');
const { logger, httpLogger } = createLogger('users-service');

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');

const app = express();
app.use(httpLogger);
app.use(mongoRequestLogger('users-service'));
app.use(express.json());
app.use('/api', userRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Users Service connected to MongoDB');
    const port = process.env.PORT || 3000;
    app.listen(port, () => logger.info(`Users Service running on port ${port}`));
  })
  .catch((err) => {
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  });
