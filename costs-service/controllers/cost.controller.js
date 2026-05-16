const Cost = require('../models/cost.model');
const ComputedReport = require('../models/computed-report.model');

// Maps stored category values to the exact response keys required by the spec.
// "sports" is stored lowercase-plural but the spec example shows "Sport" (capital S).
const CATEGORY_DISPLAY_KEYS = ['food', 'education', 'health', 'housing', 'Sport'];
const STORED_TO_DISPLAY = {
  food:      'food',
  education: 'education',
  health:    'health',
  housing:   'housing',
  sports:    'Sport',
};

function buildEmptyReport() {
  const report = {};
  CATEGORY_DISPLAY_KEYS.forEach((key) => { report[key] = []; });
  return report;
}

function isPastMonth(year, month) {
  const now = new Date();
  return year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1);
}

// POST /api/add
exports.addCost = async (req, res) => {
  try {
    const { userid, description, category, sum, created_at } = req.body;

    const costDate = created_at ? new Date(created_at) : new Date();

    // Reject dates strictly in the past (before today's date at midnight).
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (costDate < today) {
      return res.status(400).json({
        id: 'invalid-date',
        message: 'Cannot add a cost with a past date.',
      });
    }

    const cost = await Cost.create({ userid, description, category, sum, created_at: costDate });
    res.status(201).json(cost);
  } catch (err) {
    res.status(400).json({ id: 'add-cost-error', message: err.message });
  }
};

// GET /api/report?id=X&year=Y&month=Z
exports.getReport = async (req, res) => {
  try {
    const userid = parseInt(req.query.id);
    const year   = parseInt(req.query.year);
    const month  = parseInt(req.query.month);

    if ([userid, year, month].some(Number.isNaN)) {
      return res.status(400).json({
        id: 'invalid-params',
        message: 'Query params id, year, and month are required and must be numbers.',
      });
    }

    // Past month: serve from cache if already computed.
    if (isPastMonth(year, month)) {
      const cached = await ComputedReport.findOne({ userid, year, month });
      if (cached) return res.json(cached.report);
    }

    // Aggregate costs from MongoDB for the requested user / year / month.
    const costs = await Cost.find({
      userid,
      $expr: {
        $and: [
          { $eq: [{ $year: '$created_at' },  year]  },
          { $eq: [{ $month: '$created_at' }, month] },
        ],
      },
    });

    const report = buildEmptyReport();
    costs.forEach((cost) => {
      const key = STORED_TO_DISPLAY[cost.category];
      report[key].push({
        sum:         cost.sum,
        description: cost.description,
        day:         cost.created_at.getDate(),
      });
    });

    // Persist the computed report so future requests for this past month are instant.
    if (isPastMonth(year, month)) {
      await ComputedReport.create({ userid, year, month, report });
    }

    res.json(report);
  } catch (err) {
    res.status(500).json({ id: 'report-error', message: err.message });
  }
};
