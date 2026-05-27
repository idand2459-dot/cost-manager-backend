// costs-service/controllers/cost.controller.js

const Cost = require('../models/cost.model');
const ComputedReport = require('../models/computed-report.model');
const mongoose = require('mongoose');

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

// Helper to check if a month has already passed relative to current server time
// This logic handles the computed design pattern triggers
function isPastMonth(year, month) {
  const now = new Date();
  return year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1);
}

// POST /api/add
exports.addCost = async (req, res) => {
  try {
    // Extracting fields from incoming request body
    const { userid, description, category, sum, created_at } = req.body;

    // Validating that the referenced user exists in the users collection
    const userExists = await mongoose.connection.db
      .collection('users')
      .findOne({ id: Number(userid) });

    if (!userExists) {
      return res.status(404).json({
        id: 'user-not-found',
        message: `User with id ${userid} does not exist.`,
      });
    }

    // Parsing date or falling back to current system arrival time
    const costDate = created_at ? new Date(created_at) : new Date();

    // Creating and persisting the cost item in MongoDB
    const cost = await Cost.create({ userid, description, category, sum, created_at: costDate });

    // Returning success response with identical properties
    res.status(201).json(cost);
  } catch (err) {
    // Standardized error return contract
    res.status(400).json({ id: 'add-cost-error', message: err.message });
  }
};

// GET /api/report?id=X&year=Y&month=Z
exports.getReport = async (req, res) => {
  try {
    // Parse query string variables into exact numeric formats
    const userid = parseInt(req.query.id);
    const year   = parseInt(req.query.year);
    const month  = parseInt(req.query.month);

    // Validation block for required query parameters
    if ([userid, year, month].some(Number.isNaN)) {
      return res.status(400).json({
        id: 'invalid-params',
        message: 'Query params id, year, and month are required and must be numbers.',
      });
    }

    // Computed Pattern Check: If the target month is in the past, search cache first
    if (isPastMonth(year, month)) {
      const cached = await ComputedReport.findOne({ userid, year, month });
      // If found, immediately serve cached computed object to bypass aggregation pipeline
      if (cached) {
        return res.json({
          userid,
          year,
          month,
          costs: cached.report.costs,
        });
      }
    }

    // Fetching costs matching the targeted user, filtered by dynamic date expressions
    const costs = await Cost.find({
      userid,
      $expr: {
        $and: [
          { $eq: [{ $year: '$created_at' },  year]  },
          { $eq: [{ $month: '$created_at' }, month] },
        ],
      },
    });

    // Strategy to structure the array format exactly like the specified spec example
    const dynamicCategories = {};
    CATEGORY_DISPLAY_KEYS.forEach((key) => {
      dynamicCategories[key] = [];
    });

    // Populate each expense item inside its designated mapped display group
    costs.forEach((cost) => {
      const displayKey = STORED_TO_DISPLAY[cost.category] || cost.category;
      dynamicCategories[displayKey].push({
        sum:         cost.sum,
        description: cost.description,
        day:         cost.created_at.getDate(),
      });
    });

    // Building the nested array response structure required by spec item #15
    const finalCostsArray = CATEGORY_DISPLAY_KEYS.map((key) => {
      return { [key]: dynamicCategories[key] };
    });

    // Final response document wrapping data context together
    const reportResponse = {
      userid,
      year,
      month,
      costs: finalCostsArray,
    };

    // Computed Pattern Save: Persist report if target month has fully passed
    if (isPastMonth(year, month)) {
      await ComputedReport.updateOne(
        { userid, year, month },
        { $setOnInsert: { userid, year, month, report: reportResponse } },
        { upsert: true }
      );
    }

    // Emitting final parsed structure to client
    res.json(reportResponse);
  } catch (err) {
    // Fail-safe global error processing catch block
    res.status(500).json({ id: 'report-error', message: err.message });
  }
};