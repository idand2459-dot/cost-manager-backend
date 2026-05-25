// logs-service/app.js

/*
 * Entry point for the Logs microservice.
 * Handles all log-related endpoints:
 * GET /api/logs
 */

// Loading environment variables from the shared root .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Initializing the Pino logger and HTTP request logger for this service
const { createLogger } = require('../shared/logger');
const { logger, httpLogger } = createLogger('logs-service');

const express = require('express');
const mongoose = require('mongoose');
const logRoutes = require('./routes/log.routes');

const app = express();

// Middleware: Logs every incoming HTTP request using Pino
app.use(httpLogger);

// Middleware: Parses incoming JSON request bodies
app.use(express.json());

// Mounting all log-related routes under the /api prefix
app.use('/api', logRoutes);

// Connecting to MongoDB and starting the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Logs Service connected to MongoDB');
    const port = process.env.PORT || process.env.LOGS_PORT || 3001;
    app.listen(port, () => logger.info(`Logs Service running on port ${port}`));
  })
  .catch((err) => {
    // Logging the connection error and terminating the process
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  });