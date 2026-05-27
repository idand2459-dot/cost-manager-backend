// about-service/controllers/about.controller.js

/*
 * Hardcoded team member details as required by the project specification.
 * These are not stored in the database to keep the DB clean on submission.
 * Only first_name and last_name are included as per the spec requirements.
 */
const team = [
  { first_name: 'Idan', last_name: 'Dahan' },
];

/*
 * GET /api/about
 * Returns a JSON array describing the development team members.
 * Each member includes only first_name and last_name properties.
 */
exports.getAbout = (req, res) => {
  try {
    // Returning the hardcoded team array directly to the client
    res.json(team);
  } catch (err) {
    // Returning a standardized error document on unexpected failure
    res.status(500).json({
      id: 'about-fetch-error',
      message: err.message,
    });
  }
};