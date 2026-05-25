const User = require('../models/user.model');
const CostRef = require('../models/cost-ref.model');

// POST /api/users
exports.createUser = async (req, res) => {
  try {
    const { id, first_name, last_name, birthday } = req.body;

    if (!id || !first_name || !last_name || !birthday) {
      return res.status(400).json({
        id: 'missing-fields',
        message: 'id, first_name, last_name, and birthday are required.',
      });
    }

    const existing = await User.findOne({ id });
    if (existing) {
      return res.status(409).json({
        id: 'duplicate-user',
        message: `User with id ${id} already exists.`,
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
      return res.status(404).json({
        id: 'user-not-found',
        message: `User with id ${userId} not found.`,
      });
    }

    /*
     * Aggregate the total spending for this user across all cost entries.
     * Uses a read-only CostRef model pointing to the shared costs collection,
     * keeping the users service decoupled from the costs service's schema.
     */
    const [agg] = await CostRef.aggregate([
      { $match: { userid: userId } },
      { $group: { _id: null, total: { $sum: '$sum' } } },
    ]);

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
