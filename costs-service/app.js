// costs-service/app.js

// Loading environment variables from the shared root path configuration
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { createLogger, mongoRequestLogger } = require('../shared/logger');

// Initializing the specific logger context instance for this service microservice
const { logger, httpLogger } = createLogger('costs-service');

const express = require('express');
const mongoose = require('mongoose');
const costRoutes = require('./routes/cost.routes');

const app = express();

// Middleware 1: Standard pino HTTP request terminal logging decorator
app.use(httpLogger);

// Middleware 2: Parses incoming JSON request payloads (Placed early to avoid parser bypasses)
app.use(express.json());

// Middleware 3: Custom MongoDB request logger to store logs into the database collection
app.use(mongoRequestLogger('costs-service'));

// Routing boundary configuration mapped behind the specified global '/api' prefix
app.use('/api', costRoutes);

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
    logger.info('Costs Service connected to MongoDB');
    
    // Assigning execution process ports out of dynamic env configurations or default values
    const port = process.env.COSTS_PORT || 3003;
    
    // Binding the application server framework instance onto its designed network listening target
    app.listen(port, () => logger.info(`Costs Service running on port ${port}`));
  })
  .catch((err) => {
    // Catching and capturing initial cluster connection drop exception events
    logger.error({ err }, 'MongoDB connection failed');
    // Terminating current application node process execution shell sequence
    process.exit(1);
  });