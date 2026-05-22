// logs-service/app.js

// Loading environment variables from the shared root path configuration
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createLogger } = require('../shared/logger');

// Initializing the specific logger context instance for the logs microservice
const { logger, httpLogger } = createLogger('logs-service');

const express = require('express');
const mongoose = require('mongoose');
const logRoutes = require('./routes/log.routes');

const app = express();

// Middleware 1: Standard pino HTTP request terminal logging decorator
app.use(httpLogger);

// Middleware 2: Parses incoming JSON request payloads inside the express pipeline
app.use(express.json());

// Routing boundary configuration mapped behind the specified global '/api' prefix
app.use('/api', logRoutes);

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

// Executing connection adapters to establishing states with MongoDB cluster database environments
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    // Emitting logging confirmations upon successful database authentications
    logger.info('Logs Service connected to MongoDB');
    
    // Assigning execution process ports out of dynamic env configurations or default values
    const port = process.env.LOGS_PORT || 3001;
    
    // Binding the application server framework instance onto its designed network listening target
    app.listen(port, () => logger.info(`Logs Service running on port ${port}`));
  })
  .catch((err) => {
    // Catching and capturing initial cluster connection drop exception events
    logger.error({ err }, 'MongoDB connection failed');
    // Terminating current application node process execution shell sequence
    process.exit(1);
  });