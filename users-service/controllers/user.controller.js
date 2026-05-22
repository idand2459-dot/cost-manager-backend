// users-service/controllers/user.controller.js
const mongoose = require('mongoose');
const User = require('../models/user.model');

// POST /api/add
exports.createUser = async (req, res) => {
  try {
    // Extract parameters from the incoming request body context
    const { id, first_name, last_name, birthday } = req.body;

    // Requirement update (May 15, 2026): Prevent adding duplicate user documents
    const existing = await User.findOne({ id });
    if (existing) {
      // Return 409 Conflict with standard error format mapping (id + message)
      return res.status(409).json({
        id: 'user-already-exists',
        message: `User with id ${id} already exists on the database.`,
      });
    }

    // Persist new user structure to MongoDB users collection
    const user = await User.create({ id, first_name, last_name, birthday });
    
    // Return the inserted document on success state
    res.status(201).json(user);
  } catch (err) {
    // Error block mapping strictly back to system specification (id and message)
    res.status(400).json({ 
      id: 'create-user-fail', 
      message: err.message 
    });
  }
};

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    // Querying all users while restricting properties to requested specification fields
    const users = await User.find({}, 'id first_name last_name birthday -_id');
    
    // Dispatching array payload back to client
    res.json(users);
  } catch (err) {
    // Ensuring standard error response layout for global users fetch
    res.status(500).json({ 
      id: 'get-users-fail', 
      message: err.message 
    });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    // Parsing user identifier token directly from dynamic request parameters
    const userId = parseInt(req.params.id);
    
    // Locating base profile records inside collection while omitting the internal _id
    const user = await User.findOne({ id: userId }, 'id first_name last_name -_id');
    if (!user) {
      // Trigger contract error format when identity lookup misses
      return res.status(404).json({ 
        id: 'user-missing', 
        message: 'User not found.' 
      });
    }

    // Crossing system context to tally expenditures by executing a native aggregation pipeline
    const [agg] = await mongoose.connection.db
      .collection('costs')
      .aggregate([
        // Isolating costs targeted directly toward this user's numeric token
        { $match: { userid: userId } },
        // Cumulating all item sum values into a single compound result variable
        { $group: { _id: null, total: { $sum: '$sum' } } },
      ])
      .toArray();

    // Constructing standard payload response wrapper matching the instructions
    res.json({
      id:         user.id,
      first_name: user.first_name,
      last_name:  user.last_name,
      total:      agg ? agg.total : 0,
    });
  } catch (err) {
    // Capturing unexpected execution tracking errors inside compliant contract envelope
    res.status(500).json({ 
      id: 'user-profile-error', 
      message: err.message 
    });
  }
};