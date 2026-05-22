// logs-service/controllers/log.controller.js

const Log = require('../models/log.model');

// GET /api/logs
exports.getAllLogs = async (req, res) => {
  try {
    // Requesting total logs indexed from data tiers while stripping out internal meta version properties
    const logs = await Log.find({}, { _id: 0, __v: 0 }).sort({ time: -1 });
    
    // Transmitting the populated logging documents payload back to caller routing pipeline
    res.json(logs);
  } catch (err) {
    // Encapsulating server transaction failures in compliance with spec id/message standard schemas
    res.status(500).json({
      id: 'logs-fetch-error',
      message: err.message,
    });
  }
};