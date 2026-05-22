// logs-service/models/log.js
const mongoose = require('mongoose');

// Schema representing the structured Pino logs inside MongoDB
const logSchema = new mongoose.Schema(
  {
    // Log severity level number
    level: {
      type: Number,
      required: true,
    },
    // Epoch timestamp of the log event
    time: {
      type: Number,
      required: true,
    },
    // Log message text
    msg: {
      type: String,
      required: true,
    },
    // Process identifier
    pid: {
      type: Number,
    },
    // Server hostname
    hostname: {
      type: String,
    },
    // Incoming HTTP request details captured by logger
    req: {
      id: { type: Number },
      method: { type: String },
      url: { type: String },
      remoteAddress: { type: String },
      remotePort: { type: Number },
    },
    // HTTP response details captured by logger
    res: {
      statusCode: { type: Number },
    },
    // Total execution response time in milliseconds
    responseTime: {
      type: Number,
    },
    // Detailed error object if an exception occurred
    err: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    collection: 'logs',
    strict: false,
  }
);

module.exports = mongoose.model('Log', logSchema);