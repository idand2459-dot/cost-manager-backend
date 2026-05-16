const mongoose = require('mongoose');
const User = require('../models/user.model');

exports.createUser = async (req, res) => {
  try {
    const { id, first_name, last_name, birthday } = req.body;

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
    res.status(400).json({ error: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'id first_name last_name birthday -_id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await User.findOne({ id: userId }, 'id first_name last_name -_id');
    if (!user) return res.status(404).json({ error: 'User not found' });

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
      total:      agg ? agg.total : 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
