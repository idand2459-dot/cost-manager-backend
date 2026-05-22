// about-service/controllers/about.controller.js

// Hardcoded team details as strictly required by the project specifications to avoid DB dependencies
// Storing only first_name and last_name with no extra meta-data attributes
const teamManager = {
  first_name: 'Idan',
  last_name: 'Dahan'
};

// GET /api/about
exports.getAbout = (req, res) => {
  try {
    // Returning the single configuration object directly to map with test scripts expected fields
    res.json(teamManager);
  } catch (err) {
    // Encapsulating errors using compliant property criteria contracts
    res.status(500).json({
      id: 'about-fetch-error',
      message: err.message,
    });
  }
};