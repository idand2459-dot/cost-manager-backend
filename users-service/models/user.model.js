// users-service/models/user.js
const mongoose = require('mongoose');

// User schema matching course requirements
const userSchema = new mongoose.Schema(
  {
    // Student/User identification number (type: Number)
    id: {
      type: Number,
      required: true,
      unique: true,
    },
    // First name of the user
    first_name: {
      type: String,
      required: true,
      trim: true,
    },
    // Last name of the user
    last_name: {
      type: String,
      required: true,
      trim: true,
    },
    // User's birthday (type: Date)
    birthday: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);