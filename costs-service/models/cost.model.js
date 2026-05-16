const mongoose = require('mongoose');

const costSchema = new mongoose.Schema(
  {
    userid: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['food', 'health', 'housing', 'sports', 'education'],
    },
    sum: {
      type: Number,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: 'costs' }
);

module.exports = mongoose.model('Cost', costSchema);
