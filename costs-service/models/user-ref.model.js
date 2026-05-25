const mongoose = require('mongoose');

/*
 * Lightweight read-only reference to the shared users collection.
 * Used by the costs service to verify that a userid exists before
 * accepting a new cost entry. No writes are performed via this model.
 */
const userRefSchema = new mongoose.Schema(
  { id: { type: Number, required: true } },
  { collection: 'users' }
);

module.exports = mongoose.model('UserRef', userRefSchema);
