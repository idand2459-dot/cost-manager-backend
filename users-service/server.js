require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createLogger } = require('../shared/logger');
const { logger } = createLogger('users-service');
const app = require('./app');
const mongoose = require('mongoose');

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
