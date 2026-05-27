const mongoose = require('mongoose');
const User = require('../models/user.model');

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { id, first_name, last_name, birthday } = req.body;

    // Check if user already exists to prevent duplicates
    const existing = await User.findOne({ id });
    if (existing) {
      return res.status(409).json({
        id,
        message: `User with id ${id} already exists`,
      });
    }

    const user = await User.create({ id, first_name, last_name, birthday });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ id: 'create-user-error', message: err.message });
  }
};

// GET /api/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'id first_name last_name birthday -_id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ id: 'get-users-error', message: err.message });
  }
};

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findOne({ id: userId }, 'id first_name last_name birthday -_id');

    if (!user) {
      return res.status(404).json({ id: 'user-not-found', message: 'User not found' });
    }

    // Aggregate total costs for this user from the costs collection
    const [agg] = await mongoose.connection.db
      .collection('costs')
      .aggregate([
        { $match: { userid: userId } },
        { $group: { _id: null, total: { $sum: '$sum' } } },
      ])
      .toArray();

    res.json({
      id:         user.id,
      first_name: user.first_name,
      last_name:  user.last_name,
      birthday:   user.birthday,
      total:      agg ? agg.total : 0,
    });
  } catch (err) {
    res.status(500).json({ id: 'get-user-error', message: err.message });
  }
};