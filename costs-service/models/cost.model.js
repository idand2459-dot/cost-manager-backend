// costs-service/models/cost.js
const mongoose = require('mongoose');

// Cost items schema with strict collection naming
const costSchema = new mongoose.Schema(
  {
    // The id of the user who made the purchase
    userid: {
      type: Number,
      required: true,
    },
    // Description of the expense
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Category name (validation handled in controllers due to Sport/sports casing updates)
    category: {
      type: String,
      required: true,
    },
    // Expense sum (Stored as Number, which acts as double/floating point in JS)
    sum: {
      type: Number,
      required: true,
    },
    // Time of creation, defaults to request arrival time if not provided
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'costs' }
);

module.exports = mongoose.model('Cost', costSchema);