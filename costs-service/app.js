<<<<<<< HEAD
=======
// costs-service/app.js

/*
 * Entry point for the Costs microservice.
 * Handles all cost-related endpoints:
 * POST /api/add, GET /api/report
 */

// Loading environment variables from the shared root .env file
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// Initializing the Pino logger and HTTP request logger for this service
const { createLogger, mongoRequestLogger } = require('../shared/logger');
const { logger, httpLogger } = createLogger('costs-service');

>>>>>>> corrections
const express = require('express');
const { createLogger, mongoRequestLogger } = require('../shared/logger');
const costRoutes = require('./routes/cost.routes');

const { httpLogger } = createLogger('costs-service');

const app = express();

// Middleware: Logs every incoming HTTP request using Pino
app.use(httpLogger);

// Middleware: Saves request log entries to MongoDB
app.use(mongoRequestLogger('costs-service'));

// Middleware: Parses incoming JSON request bodies
app.use(express.json());

// Mounting all cost-related routes under the /api prefix
app.use('/api', costRoutes);

<<<<<<< HEAD
module.exports = app;
=======
// Connecting to MongoDB and starting the server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    logger.info('Costs Service connected to MongoDB');
    const port = process.env.COSTS_PORT || 3003;
    app.listen(port, () => logger.info(`Costs Service running on port ${port}`));
  })
  .catch((err) => {
    // Logging the connection error and terminating the process
    logger.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  });
>>>>>>> corrections
