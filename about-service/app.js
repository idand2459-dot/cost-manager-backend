// about-service/app.js

/*
 * Entry point for the About microservice.
 * Handles all developer info endpoints:
 * GET /api/about
 */

// Loading environment variables from the shared root .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Initializing the Pino logger and HTTP request logger for this service
const { createLogger, mongoRequestLogger } = require('../shared/logger');
const { logger, httpLogger } = createLogger('about-service');

const express = require('express');
const mongoose = require('mongoose');
const aboutRoutes = require('./routes/about.routes');

const app = express();

// Middleware: Logs every incoming HTTP request using Pino
app.use(httpLogger);

// Middleware: Saves request log entries to MongoDB
app.use(mongoRequestLogger('about-service'));

// Middleware: Parses incoming JSON request bodies
app.use(express.json());

// Mounting all about-related routes under the /api prefix
app.use('/api', aboutRoutes);

// Connecting to MongoDB and starting the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('About Service connected to MongoDB');
    const port = process.env.ABOUT_PORT || 3002;
    app.listen(port, () => logger.info(`About Service running on port ${port}`));
  })
  .catch((err) => {
    // Logging the connection error and terminating the process
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  });