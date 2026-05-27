// shared/logger.js

const pino = require('pino');
const pinoHttp = require('pino-http');
const pretty = require('pino-pretty');
const mongoose = require('mongoose');

function createLogger(serviceName) {
<<<<<<< HEAD
  /* Suppress all log output during tests to keep the Jest runner output clean. */
  if (process.env.NODE_ENV === 'test') {
    const logger = pino({ level: 'silent' });
    const httpLogger = (req, res, next) => next();
    return { logger, httpLogger };
  }

  // Uses pino-pretty as a direct synchronous stream — no worker threads, no flush-timeout risk.
=======
  // Creating a synchronous terminal stream decorator config
>>>>>>> corrections
  const prettyStream = pretty({ colorize: true, sync: true });
  
  // Instantiating base pino configuration module instances
  const logger = pino(
    { level: 'info', base: { service: serviceName } },
    prettyStream
  );
  
  // Binding runtime express transport layer wrapper interfaces
  const httpLogger = pinoHttp({ logger });
  return { logger, httpLogger };
}

<<<<<<< HEAD
/*
 * Express middleware: persists each completed HTTP request as a document in the
 * shared logs collection via the service's existing Mongoose connection.
 * The readyState guard silently skips writes when the connection is not ready,
 * so this middleware is safe to register before mongoose.connect() resolves.
 */
=======
// Express middleware: persists each completed request as a document in the logs collection
>>>>>>> corrections
function mongoRequestLogger(serviceName) {
  return (req, res, next) => {
    // Setting baseline timestamp marker to compute dynamic execution cost intervals
    const start = Date.now();
    
    // Attaching post-execution hooks to respond precisely when request finish sequence emits
    res.on('finish', () => {
      // Short circuit tracking routines silently if database core readyState signals disconnects
      if (mongoose.connection.readyState !== 1) return;
      
      // Injecting transaction entry directly inside targeted storage system logs collection
      mongoose.connection.db.collection('logs').insertOne({
        // Calculating server logging level indices strictly mapping with express responses
        level:        res.statusCode >= 500 ? 50 : res.statusCode >= 400 ? 40 : 30,
        // Recording absolute epoch invocation milestones
        time:         Date.now(),
        // Packaging primary message string values
        msg:          `${req.method} ${req.url} - ${res.statusCode}`,
        // Setting up current environment application descriptors
        service:      serviceName,
        // Packing specific request payload context fields
        req:          { method: req.method, url: req.url, remoteAddress: req.ip },
        // Enclosing standard outgoing operational status results
        res:          { statusCode: res.statusCode },
        // Evaluating processing delay overhead gaps in milliseconds
        responseTime: Date.now() - start,
      }).catch(() => {}); // Safety catch block to isolate logger faults from cascading up
    });
    // Escaping execution filter cascade flow control routines onward
    next();
  };
}

module.exports = { createLogger, mongoRequestLogger };