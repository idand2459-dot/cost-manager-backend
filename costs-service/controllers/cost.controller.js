// costs-service/controllers/cost.controller.js

const Cost = require('../models/cost.model');
const ComputedReport = require('../models/computed-report.model');
<<<<<<< HEAD
const UserRef = require('../models/user-ref.model');
=======
const mongoose = require('mongoose');
>>>>>>> corrections

/*
 * Category mapping: stored values → report response keys.
 * All five categories always appear in the report, even when empty,
 * as required by the spec's monthly report structure.
 */
const VALID_CATEGORIES = ['food', 'health', 'housing', 'sports', 'education'];
const CATEGORY_DISPLAY_KEYS = ['food', 'education', 'health', 'housing', 'sports'];

<<<<<<< HEAD
function buildEmptyReport() {
  const report = {};
  CATEGORY_DISPLAY_KEYS.forEach((key) => { report[key] = []; });
  return report;
}

// Returns true if the given year/month precedes the current calendar month.
=======
// Helper to check if a month has already passed relative to current server time
// This logic handles the computed design pattern triggers
>>>>>>> corrections
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

<<<<<<< HEAD
    /* Validate all required fields up front for clear, structured error responses.
       Mongoose schema validation would also catch these, but we want the {id, message} format. */
    if (userid === undefined || !description || !category || sum === undefined) {
      return res.status(400).json({
        id: 'missing-fields',
        message: 'userid, description, category, and sum are required.',
      });
    }

    // Validate category against the allowed enum values.
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({
        id: 'invalid-category',
        message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}.`,
      });
    }

    // Verify the referenced user exists in the users collection.
    const userExists = await UserRef.findOne({ id: userid });
    if (!userExists) {
      return res.status(404).json({
        id: 'user-not-found',
        message: `User with id ${userid} not found.`,
      });
    }

    const costDate = created_at ? new Date(created_at) : new Date();

    /*
     * Reject past-dated costs to keep the computed cache consistent.
     * A cached report for a past month must never become stale after it is created,
     * so we disallow adding costs that would fall into an already-closed month.
     */
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (costDate < today) {
      return res.status(400).json({
        id: 'invalid-date',
        message: 'Cannot add a cost with a past date.',
=======
    // Validating that the referenced user exists in the users collection
    const userExists = await mongoose.connection.db
      .collection('users')
      .findOne({ id: Number(userid) });

    if (!userExists) {
      return res.status(404).json({
        id: 'user-not-found',
        message: `User with id ${userid} does not exist.`,
>>>>>>> corrections
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

<<<<<<< HEAD
    /*
     * Computed Pattern: past-month reports are immutable once the month has passed.
     * On first request we build the report and persist it in computed_reports.
     * All subsequent requests for the same (userid, year, month) are served from
     * cache without touching the costs collection — O(1) instead of O(n).
     */
=======
    // Computed Pattern Check: If the target month is in the past, search cache first
>>>>>>> corrections
    if (isPastMonth(year, month)) {
      const cached = await ComputedReport.findOne({ userid, year, month });
      // If found, immediately serve cached computed object to bypass aggregation pipeline
      if (cached) {
        return res.json({
          userid,
          year,
          month,
          costs: CATEGORY_DISPLAY_KEYS.map((key) => ({ [key]: cached.report[key] })),
        });
      }
    }

<<<<<<< HEAD
    // Aggregate costs from the database for the requested user / year / month.
=======
    // Fetching costs matching the targeted user, filtered by dynamic date expressions
>>>>>>> corrections
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
<<<<<<< HEAD
      report[cost.category].push({
=======
      const displayKey = STORED_TO_DISPLAY[cost.category] || cost.category;
      dynamicCategories[displayKey].push({
>>>>>>> corrections
        sum:         cost.sum,
        description: cost.description,
        day:         cost.created_at.getDate(),
      });
    });

<<<<<<< HEAD
    /*
     * Persist the computed report using upsert so concurrent requests for the same
     * past month cannot cause a duplicate-key error on the unique index.
     * $setOnInsert ensures the report is written only when creating a new document.
     */
    if (isPastMonth(year, month)) {
      await ComputedReport.findOneAndUpdate(
        { userid, year, month },
        { $setOnInsert: { report } },
        { upsert: true }
      );
=======
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
      await ComputedReport.create({ userid, year, month, report: reportResponse });
>>>>>>> corrections
    }

    // Emitting final parsed structure to client
    res.json(reportResponse);
  } catch (err) {
    // Fail-safe global error processing catch block
    res.status(500).json({ id: 'report-error', message: err.message });
  }
};