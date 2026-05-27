// users-service/app.js

/*
 * Entry point for the Users microservice.
 * Handles all user-related endpoints:
 * POST /api/users, GET /api/users, GET /api/users/:id
 */

// Loading environment variables from the shared root .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Initializing the Pino logger and HTTP request logger for this service
const { createLogger, mongoRequestLogger } = require('../shared/logger');
const { logger, httpLogger } = createLogger('users-service');

const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user.routes');

const app = express();

// Middleware: Logs every incoming HTTP request using Pino
app.use(httpLogger);

// Middleware: Saves request log entries to MongoDB
app.use(mongoRequestLogger('users-service'));

// Middleware: Parses incoming JSON request bodies
app.use(express.json());

// Mounting all user-related routes under the /api prefix
app.use('/api', userRoutes);

// Connecting to MongoDB and starting the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Users Service connected to MongoDB');
    const port = process.env.PORT || 3000;
    app.listen(port, () => logger.info(`Users Service running on port ${port}`));
  })
  .catch((err) => {
    // Logging the connection error and terminating the process
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  });