// about-service/app.js

// Loading environment variables from the shared root path configuration
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createLogger } = require('../shared/logger');

// Initializing the specific logger context instance for the about microservice
const { logger, httpLogger } = createLogger('about-service');

const express = require('express');
const aboutRoutes = require('./routes/about.routes');

const app = express();

// Middleware 1: Standard pino HTTP request terminal logging decorator
app.use(httpLogger);

// Middleware 2: Parses incoming JSON request payloads inside the express pipeline
app.use(express.json());

// Routing boundary configuration mapped behind the specified global '/api' prefix
app.use('/api', aboutRoutes);

// Global Error Handler Middleware: Catches syntax errors like malformed incoming JSON bodies
app.use((err, req, res, next) => {
  // Verifying if the exception is a standard Express body-parser failure payload
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Returning standard course specification criteria structure (id + message)
    return res.status(400).json({
      id: 'malformed-json-payload',
      message: 'The submitted request payload contains invalid broken JSON syntax.'
    });
  }
  // Passing unexpected error frames along to standard cascading engine blocks
  next(err);
});

// Assigning execution process ports out of dynamic env configurations or default values
const port = process.env.ABOUT_PORT || 3002;

// Binding the application server framework instance onto its designed network listening target
app.listen(port, () => logger.info(`About Service running on port ${port}`));