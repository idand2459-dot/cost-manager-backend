const pino = require('pino');
const pinoHttp = require('pino-http');
const pretty = require('pino-pretty');
const mongoose = require('mongoose');

function createLogger(serviceName) {
  /* Suppress all log output during tests to keep the Jest runner output clean. */
  if (process.env.NODE_ENV === 'test') {
    const logger = pino({ level: 'silent' });
    const httpLogger = (req, res, next) => next();
    return { logger, httpLogger };
  }

  // Uses pino-pretty as a direct synchronous stream — no worker threads, no flush-timeout risk.
  const prettyStream = pretty({ colorize: true, sync: true });
  const logger = pino(
    { level: 'info', base: { service: serviceName } },
    prettyStream
  );
  const httpLogger = pinoHttp({ logger });
  return { logger, httpLogger };
}

/*
 * Express middleware: persists each completed HTTP request as a document in the
 * shared logs collection via the service's existing Mongoose connection.
 * The readyState guard silently skips writes when the connection is not ready,
 * so this middleware is safe to register before mongoose.connect() resolves.
 */
function mongoRequestLogger(serviceName) {
  return (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      if (mongoose.connection.readyState !== 1) return;
      mongoose.connection.db.collection('logs').insertOne({
        level:        res.statusCode >= 500 ? 50 : res.statusCode >= 400 ? 40 : 30,
        time:         Date.now(),
        msg:          `${req.method} ${req.url} - ${res.statusCode}`,
        service:      serviceName,
        req:          { method: req.method, url: req.url, remoteAddress: req.ip },
        res:          { statusCode: res.statusCode },
        responseTime: Date.now() - start,
      }).catch(() => {});
    });
    next();
  };
}

module.exports = { createLogger, mongoRequestLogger };
