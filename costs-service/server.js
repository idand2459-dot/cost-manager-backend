require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createLogger } = require('../shared/logger');
const { logger } = createLogger('costs-service');
const app = require('./app');
const mongoose = require('mongoose');

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
