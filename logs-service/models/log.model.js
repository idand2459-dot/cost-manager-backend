const mongoose = require('mongoose');

const logSchema = new mongoose.Schema(
  {
    level: {
      type: Number,
      required: true,
    },
    time: {
      type: Number,
      required: true,
    },
    msg: {
      type: String,
      required: true,
    },
    pid: {
      type: Number,
    },
    hostname: {
      type: String,
    },
    req: {
      id: { type: Number },
      method: { type: String },
      url: { type: String },
      remoteAddress: { type: String },
      remotePort: { type: Number },
    },
    res: {
      statusCode: { type: Number },
    },
    responseTime: {
      type: Number,
    },
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
