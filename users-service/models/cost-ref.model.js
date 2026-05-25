const mongoose = require('mongoose');

/*
 * Lightweight read-only reference to the shared costs collection.
 * Used by the users service to aggregate total spending per user.
 * No writes are performed via this model.
 */
const costRefSchema = new mongoose.Schema(
  {
    userid: { type: Number },
    sum:    { type: Number },
  },
  { collection: 'costs' }
);

module.exports = mongoose.model('CostRef', costRefSchema);
