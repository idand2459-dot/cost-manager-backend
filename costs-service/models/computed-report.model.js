
const mongoose = require('mongoose');

/* =============================================================================
COMPUTED DESIGN PATTERN IMPLEMENTATION
-----------------------------------------------------------------------------
This model implements the Computed Design Pattern requested in the guidelines.
When a monthly report is requested for a month that has already passed, 
the server calculates it once and saves the final output document inside 
the 'computed_reports' collection. 
Subsequent GET requests for the same user, year, and month will fetch the 
pre-computed data directly from this collection instead of recalculating 
it from the 'costs' collection, saving server CPU and database I/O.
=============================================================================
*/

const computedReportSchema = new mongoose.Schema(
  {
    // Target user id
    userid: { type: Number, required: true },
    // Target year
    year:   { type: Number, required: true },
    // Target month
    month:  { type: Number, required: true },
    // The full pre-calculated JSON report structure
    report: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { collection: 'computed_reports' }
);

// Ensuring fast lookup and preventing duplicate cached reports
computedReportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('ComputedReport', computedReportSchema);