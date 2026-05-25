require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createLogger } = require('../shared/logger');
const { logger } = createLogger('about-service');
const app = require('./app');
const mongoose = require('mongoose');

/*
 * The about service connects to MongoDB for request logging only.
 * If the connection fails, the service continues to operate normally —
 * team info is hardcoded and does not depend on the database.
 */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info('About Service connected to MongoDB (request logging active)'))
  .catch((err) => logger.warn({ err }, 'About Service MongoDB connection failed — request logging disabled'));

const port = process.env.ABOUT_PORT || 3002;
app.listen(port, () => logger.info(`About Service running on port ${port}`));
