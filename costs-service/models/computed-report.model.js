const mongoose = require('mongoose');

// Stores pre-computed monthly reports for past months (Computed Design Pattern).
// A report is immutable once the month has passed, so we cache it here on first request.
const computedReportSchema = new mongoose.Schema(
  {
    userid: { type: Number, required: true },
    year:   { type: Number, required: true },
    month:  { type: Number, required: true },
    report: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { collection: 'computed_reports' }
);

computedReportSchema.index({ userid: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('ComputedReport', computedReportSchema);
