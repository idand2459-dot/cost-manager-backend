const Log = require('../models/log.model');

exports.getAllLogs = async (req, res) => {
  try {
    const logs = await Log.find({}, { _id: 0, __v: 0 }).sort({ time: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({
      id: 'logs-fetch-error',
      message: err.message,
    });
  }
};
