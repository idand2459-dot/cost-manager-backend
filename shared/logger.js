const pino = require('pino');
const pinoHttp = require('pino-http');
const pretty = require('pino-pretty');
const mongoose = require('mongoose');

// Uses pino-pretty as a direct synchronous stream — no worker threads, no flush-timeout risk.
function createLogger(serviceName) {
  const prettyStream = pretty({ colorize: true, sync: true });
  const logger = pino(
    { level: 'info', base: { service: serviceName } },
    prettyStream
  );
  const httpLogger = pinoHttp({ logger });
  return { logger, httpLogger };
}

// Express middleware: persists each completed request as a document in the logs collection
// via the service's existing Mongoose connection. Safe to register before connect() —
// the readyState guard silently skips writes until the connection is ready.
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
